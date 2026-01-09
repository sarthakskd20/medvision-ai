"""
Document verification service using Gemini 3 Vision.
Analyzes uploaded documents and cross-checks with form data.
"""

import base64
import json
from typing import List, Optional
import google.generativeai as genai

from app.config import settings
from app.models.user import (
    VerificationResult,
    VerificationStatus,
    TIER_1_COUNTRIES,
    TIER_2_COUNTRIES
)


class VerificationService:
    """Service for verifying doctor documents using Gemini 3 Vision."""
    
    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            self.vision_model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            self.model = None
            self.vision_model = None
    
    def get_country_tier(self, country: str) -> int:
        """Get verification tier for country."""
        if country in TIER_1_COUNTRIES:
            return 1
        elif country in TIER_2_COUNTRIES:
            return 2
        return 3
    
    def get_approval_threshold(self, tier: int) -> float:
        """Get auto-approval threshold based on country tier."""
        thresholds = {
            1: 85.0,   # Tier 1: Lower threshold (can cross-check with registry)
            2: 90.0,   # Tier 2: Medium threshold
            3: 95.0    # Tier 3: High threshold (manual review more likely)
        }
        return thresholds.get(tier, 95.0)
    
    async def analyze_document(self, image_data: bytes, mime_type: str) -> dict:
        """Analyze a single document using Gemini Vision."""
        if not self.vision_model:
            return {
                "error": "Gemini API not configured",
                "extracted_text": "",
                "document_type": "unknown",
                "authenticity_score": 0
            }
        
        prompt = """
        Analyze this medical professional document. Extract and return the following in JSON format:
        
        {
            "document_type": "degree|license|hospital_id|certificate|unknown",
            "extracted_name": "Full name as appears on document",
            "extracted_registration_number": "Any registration/license number found",
            "extracted_institution": "University or issuing institution",
            "extracted_specialization": "Medical specialization if mentioned",
            "issue_date": "Date of issue if visible",
            "expiry_date": "Expiry date if visible",
            "country_of_origin": "Country where document was issued",
            "has_official_seal": true/false,
            "has_signature": true/false,
            "has_qr_code": true/false,
            "has_hologram_or_watermark": true/false,
            "text_clarity_score": 0-100,
            "tampering_indicators": ["list", "of", "any", "suspicious", "elements"],
            "authenticity_confidence": 0-100,
            "notes": "Any additional observations"
        }
        
        Be thorough in your analysis. Look for signs of tampering, editing, or forgery.
        Return ONLY the JSON object, no other text.
        """
        
        try:
            # Prepare image for Gemini
            image_part = {
                "mime_type": mime_type,
                "data": base64.b64encode(image_data).decode('utf-8')
            }
            
            response = self.vision_model.generate_content([prompt, image_part])
            
            # Parse JSON from response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            return json.loads(text.strip())
            
        except Exception as e:
            return {
                "error": str(e),
                "extracted_text": "",
                "document_type": "unknown",
                "authenticity_score": 0
            }
    
    async def verify_doctor_documents(
        self,
        form_data: dict,
        documents: List[tuple]  # List of (image_data, mime_type)
    ) -> VerificationResult:
        """
        Verify doctor documents against form data.
        Returns detailed field-by-field verification results.
        
        Args:
            form_data: Dictionary with name, country, registration_number, specialization
            documents: List of (bytes, mime_type) tuples for uploaded documents
        
        Returns:
            VerificationResult with status, score, and detailed field verification
        """
        if not documents:
            return VerificationResult(
                status=VerificationStatus.REJECTED,
                confidence_score=0.0,
                extracted_data={},
                matches={},
                issues=["No documents provided"],
                recommendation="Please upload at least one document."
            )
        
        # Analyze each document
        all_extracted = []
        total_authenticity = 0
        document_analysis = []
        
        for idx, (doc_data, mime_type) in enumerate(documents):
            result = await self.analyze_document(doc_data, mime_type)
            all_extracted.append(result)
            
            authenticity = result.get("authenticity_confidence", 0)
            total_authenticity += authenticity
            
            # Build document analysis entry
            doc_entry = {
                "document_number": idx + 1,
                "document_type": result.get("document_type", "unknown"),
                "authenticity_score": authenticity,
                "text_clarity": result.get("text_clarity_score", 0),
                "has_official_seal": result.get("has_official_seal", False),
                "has_signature": result.get("has_signature", False),
                "has_qr_code": result.get("has_qr_code", False),
                "has_watermark": result.get("has_hologram_or_watermark", False),
                "tampering_detected": len(result.get("tampering_indicators", [])) > 0,
                "tampering_details": result.get("tampering_indicators", []),
                "extracted_name": result.get("extracted_name", "Not found"),
                "extracted_registration": result.get("extracted_registration_number", "Not found"),
                "extracted_institution": result.get("extracted_institution", "Not found"),
                "extracted_specialization": result.get("extracted_specialization", "Not found"),
                "country_of_origin": result.get("country_of_origin", "Not found"),
                "notes": result.get("notes", "")
            }
            document_analysis.append(doc_entry)
        
        avg_authenticity = total_authenticity / len(documents) if documents else 0
        
        # Extract form data
        form_name = form_data.get("name", "").strip()
        form_reg = form_data.get("registration_number", "").strip()
        form_spec = form_data.get("specialization", "").strip()
        form_country = form_data.get("country", "").strip()
        
        # Build field verification with detailed matching
        field_verification = []
        
        # Find best matches from all documents
        best_name_match = {"extracted": "Not found in documents", "confidence": 0, "match": False}
        best_reg_match = {"extracted": "Not found in documents", "confidence": 0, "match": False}
        best_spec_match = {"extracted": "Not found in documents", "confidence": 0, "match": False}
        best_country_match = {"extracted": "Not found in documents", "confidence": 0, "match": False}
        
        for doc in all_extracted:
            # Check name
            doc_name = doc.get("extracted_name", "")
            if doc_name:
                name_similarity = self._calculate_similarity(form_name.lower(), doc_name.lower())
                if name_similarity > best_name_match["confidence"]:
                    best_name_match = {
                        "extracted": doc_name,
                        "confidence": name_similarity,
                        "match": name_similarity >= 70
                    }
            
            # Check registration number
            doc_reg = doc.get("extracted_registration_number", "")
            if doc_reg:
                reg_similarity = self._calculate_similarity(form_reg.lower(), doc_reg.lower())
                if reg_similarity > best_reg_match["confidence"]:
                    best_reg_match = {
                        "extracted": doc_reg,
                        "confidence": reg_similarity,
                        "match": reg_similarity >= 80
                    }
            
            # Check specialization
            doc_spec = doc.get("extracted_specialization", "")
            if doc_spec:
                spec_similarity = self._calculate_similarity(form_spec.lower(), doc_spec.lower())
                if spec_similarity > best_spec_match["confidence"]:
                    best_spec_match = {
                        "extracted": doc_spec,
                        "confidence": spec_similarity,
                        "match": spec_similarity >= 60
                    }
            
            # Check country
            doc_country = doc.get("country_of_origin", "")
            if doc_country:
                country_similarity = self._calculate_similarity(form_country.lower(), doc_country.lower())
                if country_similarity > best_country_match["confidence"]:
                    best_country_match = {
                        "extracted": doc_country,
                        "confidence": country_similarity,
                        "match": country_similarity >= 50
                    }
        
        # Build field verification list
        field_verification = [
            {
                "field": "Name",
                "form_value": form_name,
                "extracted_value": best_name_match["extracted"],
                "match": best_name_match["match"],
                "confidence": best_name_match["confidence"],
                "weight": 30,
                "status": "verified" if best_name_match["match"] else "mismatch"
            },
            {
                "field": "Registration Number",
                "form_value": form_reg,
                "extracted_value": best_reg_match["extracted"],
                "match": best_reg_match["match"],
                "confidence": best_reg_match["confidence"],
                "weight": 30,
                "status": "verified" if best_reg_match["match"] else "mismatch"
            },
            {
                "field": "Specialization",
                "form_value": form_spec,
                "extracted_value": best_spec_match["extracted"],
                "match": best_spec_match["match"],
                "confidence": best_spec_match["confidence"],
                "weight": 20,
                "status": "verified" if best_spec_match["match"] else "mismatch"
            },
            {
                "field": "Country",
                "form_value": form_country,
                "extracted_value": best_country_match["extracted"],
                "match": best_country_match["match"],
                "confidence": best_country_match["confidence"],
                "weight": 20,
                "status": "verified" if best_country_match["match"] else "mismatch"
            }
        ]
        
        # Calculate match score from field verification
        match_score = sum([f["weight"] for f in field_verification if f["match"]])
        
        # Build matches dict for backward compatibility
        matches = {
            "name_match": best_name_match["match"],
            "registration_match": best_reg_match["match"],
            "specialization_match": best_spec_match["match"],
            "country_match": best_country_match["match"]
        }
        
        # Collect issues
        issues = []
        for field in field_verification:
            if not field["match"]:
                if field["extracted_value"] == "Not found in documents":
                    issues.append(f"{field['field']} not found in uploaded documents")
                else:
                    issues.append(f"{field['field']} mismatch: Form says '{field['form_value']}', document shows '{field['extracted_value']}'")
        
        # Check for tampering across all documents
        for doc in document_analysis:
            if doc["tampering_detected"]:
                issues.append(f"Document {doc['document_number']}: Possible tampering detected - {', '.join(doc['tampering_details'])}")
        
        # Calculate final score
        final_score = (avg_authenticity * 0.6) + (match_score * 0.4)
        
        # Determine status based on country tier
        country_tier = self.get_country_tier(form_country)
        threshold = self.get_approval_threshold(country_tier)
        
        if final_score >= threshold:
            status = VerificationStatus.APPROVED
            recommendation = f"Documents verified successfully with {final_score:.1f}% confidence. Doctor is approved."
        elif final_score >= 50:
            status = VerificationStatus.MANUAL_REVIEW
            recommendation = f"Confidence score ({final_score:.1f}%) is below auto-approval threshold ({threshold}%). Manual review required."
        else:
            status = VerificationStatus.REJECTED
            recommendation = "Documents could not be verified. Please resubmit clearer documents showing your credentials."
        
        # Build comprehensive extracted_data
        extracted_data = {
            "documents": all_extracted,
            "document_analysis": document_analysis,
            "field_verification": field_verification,
            "verification_breakdown": {
                "authenticity_score": round(avg_authenticity, 1),
                "match_score": match_score,
                "final_score": round(final_score, 1),
                "country_tier": country_tier,
                "approval_threshold": threshold,
                "documents_analyzed": len(documents)
            }
        }
        
        return VerificationResult(
            status=status,
            confidence_score=final_score,
            extracted_data=extracted_data,
            matches=matches,
            issues=issues,
            recommendation=recommendation
        )
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity between two strings (0-100)."""
        if not str1 or not str2:
            return 0
        
        # Exact match
        if str1 == str2:
            return 100
        
        # One contains the other
        if str1 in str2 or str2 in str1:
            return 85
        
        # Word-based matching
        words1 = set(str1.split())
        words2 = set(str2.split())
        
        if not words1 or not words2:
            return 0
        
        common = words1 & words2
        total = words1 | words2
        
        return (len(common) / len(total)) * 100 if total else 0


# Singleton instance
verification_service = VerificationService()
