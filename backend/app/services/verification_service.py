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
        
        Args:
            form_data: Dictionary with name, country, registration_number, specialization
            documents: List of (bytes, mime_type) tuples for uploaded documents
        
        Returns:
            VerificationResult with status, score, and details
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
        
        for doc_data, mime_type in documents:
            result = await self.analyze_document(doc_data, mime_type)
            all_extracted.append(result)
            total_authenticity += result.get("authenticity_confidence", 0)
        
        avg_authenticity = total_authenticity / len(documents)
        
        # Cross-check with form data
        matches = {
            "name_match": False,
            "registration_match": False,
            "specialization_match": False,
            "country_match": False
        }
        
        issues = []
        form_name = form_data.get("name", "").lower()
        form_reg = form_data.get("registration_number", "").lower()
        form_spec = form_data.get("specialization", "").lower()
        form_country = form_data.get("country", "").lower()
        
        for doc in all_extracted:
            # Check name
            doc_name = doc.get("extracted_name", "").lower()
            if doc_name and form_name in doc_name or doc_name in form_name:
                matches["name_match"] = True
            
            # Check registration number
            doc_reg = doc.get("extracted_registration_number", "").lower()
            if doc_reg and (form_reg in doc_reg or doc_reg in form_reg):
                matches["registration_match"] = True
            
            # Check specialization
            doc_spec = doc.get("extracted_specialization", "").lower()
            if doc_spec and form_spec in doc_spec:
                matches["specialization_match"] = True
            
            # Check country
            doc_country = doc.get("country_of_origin", "").lower()
            if doc_country and form_country in doc_country:
                matches["country_match"] = True
            
            # Check for tampering
            tampering = doc.get("tampering_indicators", [])
            if tampering:
                issues.extend([f"Possible tampering detected: {t}" for t in tampering])
        
        # Calculate match score
        match_score = sum([
            30 if matches["name_match"] else 0,
            30 if matches["registration_match"] else 0,
            20 if matches["specialization_match"] else 0,
            20 if matches["country_match"] else 0
        ])
        
        # Calculate final score
        final_score = (avg_authenticity * 0.6) + (match_score * 0.4)
        
        # Add issues for non-matches
        if not matches["name_match"]:
            issues.append("Name on documents does not match form")
        if not matches["registration_match"]:
            issues.append("Registration number not found in documents")
        
        # Determine status
        country_tier = self.get_country_tier(form_data.get("country", ""))
        threshold = self.get_approval_threshold(country_tier)
        
        if final_score >= threshold:
            status = VerificationStatus.APPROVED
            recommendation = "Documents verified successfully. Doctor is approved."
        elif final_score >= 50:
            status = VerificationStatus.MANUAL_REVIEW
            recommendation = f"Confidence score ({final_score:.1f}%) requires manual review."
        else:
            status = VerificationStatus.REJECTED
            recommendation = "Documents could not be verified. Please resubmit clearer documents."
        
        return VerificationResult(
            status=status,
            confidence_score=final_score,
            extracted_data={"documents": all_extracted},
            matches=matches,
            issues=issues,
            recommendation=recommendation
        )


# Singleton instance
verification_service = VerificationService()
