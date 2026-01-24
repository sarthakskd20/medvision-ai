"""
PDF Service - Extract text and metadata from medical PDF documents.
Uses PyMuPDF (fitz) for text extraction and regex for date detection.
"""

import re
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Any
from io import BytesIO

# Try to import fitz (PyMuPDF), gracefully handle if not installed
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    print("Warning: PyMuPDF not installed. PDF extraction will be limited.")


class PDFService:
    """Service for extracting text and metadata from PDF files."""
    
    # Common date patterns in medical reports
    DATE_PATTERNS = [
        # DD/MM/YYYY, DD-MM-YYYY
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b',
        # YYYY-MM-DD (ISO format)
        r'\b(\d{4}-\d{2}-\d{2})\b',
        # Month DD, YYYY
        r'\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b',
        # DD Month YYYY
        r'\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b',
    ]
    
    # Keywords that indicate report date vs other dates
    DATE_CONTEXT_KEYWORDS = [
        'date:', 'report date:', 'collection date:', 'sample date:',
        'test date:', 'dated:', 'date of report:', 'received:',
        'collected on:', 'reported on:'
    ]
    
    def __init__(self):
        self.upload_dir = Path("data/uploads")
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract all text content from a PDF file by path."""
        if not PYMUPDF_AVAILABLE:
            return "[PDF extraction unavailable - PyMuPDF not installed]"
        
        try:
            full_path = Path(file_path)
            if not full_path.exists():
                full_path = self.upload_dir / file_path
                if not full_path.exists():
                    return f"[File not found: {file_path}]"
            
            text_content = []
            doc = fitz.open(str(full_path))
            
            for page_num, page in enumerate(doc):
                text = page.get_text()
                if text.strip():
                    text_content.append(f"--- Page {page_num + 1} ---\n{text}")
            
            doc.close()
            return "\n\n".join(text_content) if text_content else "[No text content found in PDF]"
            
        except Exception as e:
            return f"[Error extracting PDF: {str(e)}]"
    
    def extract_text_from_bytes(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF bytes (for uploaded files)."""
        if not PYMUPDF_AVAILABLE:
            return "[PDF extraction unavailable]"
        try:
            pdf_stream = BytesIO(pdf_bytes)
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
            
            text_parts = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                if text.strip():
                    text_parts.append(f"--- Page {page_num + 1} ---\n{text}")
            
            doc.close()
            return "\n\n".join(text_parts)
        except Exception as e:
            return f"[Error: {str(e)}]"
    
    def detect_report_date(self, text: str) -> Optional[str]:
        """Attempt to detect the report/test date from PDF text."""
        text_lower = text.lower()
        
        # First, look for dates near context keywords
        for keyword in self.DATE_CONTEXT_KEYWORDS:
            keyword_pos = text_lower.find(keyword)
            if keyword_pos != -1:
                search_region = text[keyword_pos:keyword_pos + 100]
                for pattern in self.DATE_PATTERNS:
                    match = re.search(pattern, search_region, re.IGNORECASE)
                    if match:
                        return match.group(1)
        
        # Fallback: find first date in document
        for pattern in self.DATE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def extract_key_attributes(self, text: str) -> Dict[str, Any]:
        """Extract key medical attributes from PDF text."""
        return {
            "detected_date": self.detect_report_date(text),
            "report_type": self._detect_report_type(text),
            "lab_values": self._extract_lab_values(text),
            "diagnoses": self._extract_diagnoses(text),
            "medications_mentioned": self._extract_medications(text),
            "word_count": len(text.split()),
            "has_content": len(text.strip()) > 50
        }
    
    def _detect_report_type(self, text: str) -> str:
        """Detect the type of medical report."""
        text_lower = text.lower()
        
        report_types = {
            "blood_test": ["cbc", "complete blood count", "hemoglobin", "wbc", "rbc", "platelet"],
            "liver_function": ["sgpt", "sgot", "alt", "ast", "bilirubin", "liver function"],
            "kidney_function": ["creatinine", "bun", "urea", "kidney function", "renal"],
            "lipid_profile": ["cholesterol", "triglyceride", "hdl", "ldl", "lipid profile"],
            "thyroid": ["tsh", "t3", "t4", "thyroid"],
            "diabetes": ["hba1c", "fasting glucose", "blood sugar", "diabetes"],
            "urine_analysis": ["urinalysis", "urine routine", "urine test"],
            "imaging": ["x-ray", "ct scan", "mri", "ultrasound", "sonography"],
            "ecg": ["ecg", "ekg", "electrocardiogram"],
            "prescription": ["rx", "prescription", "dispense", "tablet", "capsule"]
        }
        
        for report_type, keywords in report_types.items():
            if any(kw in text_lower for kw in keywords):
                return report_type
        
        return "general_report"
    
    def _extract_lab_values(self, text: str) -> List[Dict[str, str]]:
        """Extract lab values with their units."""
        values = []
        
        lab_tests = {
            "Hemoglobin": r"(?:hemoglobin|hb|hgb)\s*[:\-]?\s*(\d+\.?\d*)\s*(g/dL|g/L)?",
            "WBC": r"(?:wbc|white blood cells?|leucocytes?)\s*[:\-]?\s*(\d+\.?\d*)\s*(K/uL|cells/mcL|/cumm)?",
            "RBC": r"(?:rbc|red blood cells?|erythrocytes?)\s*[:\-]?\s*(\d+\.?\d*)\s*(M/uL|million/cumm)?",
            "Platelets": r"(?:platelets?|plt)\s*[:\-]?\s*(\d+\.?\d*)\s*(K/uL|lakhs/cumm)?",
            "Blood Sugar": r"(?:blood sugar|glucose|fbs|fasting)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL)?",
            "Creatinine": r"(?:creatinine)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL)?",
            "Cholesterol": r"(?:total cholesterol|cholesterol)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL)?",
        }
        
        for test_name, pattern in lab_tests.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                values.append({
                    "test": test_name,
                    "value": match.group(1),
                    "unit": match.group(2) if len(match.groups()) > 1 and match.group(2) else ""
                })
        
        return values
    
    def _extract_diagnoses(self, text: str) -> List[str]:
        """Extract mentioned diagnoses or conditions."""
        diagnoses = []
        text_lower = text.lower()
        
        conditions = [
            "diabetes", "hypertension", "anemia", "infection", "fever",
            "tuberculosis", "pneumonia", "asthma", "copd", "arthritis",
            "thyroid", "hyperthyroidism", "hypothyroidism", "cancer",
            "hepatitis", "malaria", "dengue", "covid", "coronavirus"
        ]
        
        for condition in conditions:
            if condition in text_lower:
                diagnoses.append(condition.title())
        
        return diagnoses
    
    def _extract_medications(self, text: str) -> List[str]:
        """Extract mentioned medication names."""
        medications = []
        text_lower = text.lower()
        
        common_meds = [
            "paracetamol", "amoxicillin", "azithromycin", "metformin",
            "atorvastatin", "amlodipine", "omeprazole", "pantoprazole",
            "ciprofloxacin", "doxycycline", "ibuprofen", "aspirin",
            "lisinopril", "metoprolol", "losartan", "gabapentin",
            "prednisone", "levothyroxine", "salbutamol", "cetrizine"
        ]
        
        for med in common_meds:
            if med in text_lower:
                medications.append(med.title())
        
        return medications
    
    def get_document_by_id(self, file_id: str) -> Optional[Path]:
        """Get the file path for a document by its ID."""
        for file_path in self.upload_dir.glob(f"{file_id}.*"):
            if file_path.exists():
                return file_path
        return None
    
    def extract_from_document_id(self, file_id: str) -> Dict[str, Any]:
        """Extract all information from a document by its ID."""
        file_path = self.get_document_by_id(file_id)
        if not file_path:
            return {
                "success": False,
                "error": f"Document not found: {file_id}",
                "text": "",
                "attributes": {}
            }
        
        text = self.extract_text_from_pdf(str(file_path))
        attributes = self.extract_key_attributes(text)
        
        return {
            "success": True,
            "file_id": file_id,
            "file_path": str(file_path),
            "text": text,
            "attributes": attributes
        }


# Singleton instance
pdf_service = PDFService()


def get_pdf_service() -> PDFService:
    """Get the PDF service singleton."""
    return pdf_service


# Legacy function compatibility
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Legacy function for backward compatibility."""
    return pdf_service.extract_text_from_bytes(pdf_bytes)


def extract_tables_from_pdf(pdf_bytes: bytes) -> list:
    """Extract tables from a PDF file."""
    if not PYMUPDF_AVAILABLE:
        return []
    try:
        pdf_stream = BytesIO(pdf_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
        
        tables = []
        for page in doc:
            page_tables = page.find_tables()
            for table in page_tables:
                table_data = table.extract()
                if table_data:
                    tables.append(table_data)
        
        doc.close()
        return tables
    except Exception as e:
        print(f"Error extracting tables: {e}")
        return []
