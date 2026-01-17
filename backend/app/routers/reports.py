"""
Reports Router
Handles lab report upload and interpretation for patients.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
from app.services.gemini_service import GeminiService
from app.services.pdf_service import extract_text_from_pdf
from app.services.report_storage_service import get_report_storage

router = APIRouter()
gemini = GeminiService()


@router.post("/upload-and-interpret")
async def upload_and_interpret_report(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None)
):
    """
    Upload a lab report and get plain-language interpretation.
    This is the PATIENT-FACING feature.
    If patient_id is provided, the report will be saved for future reference.
    """
    # Validate file type
    allowed_types = [".pdf", ".png", ".jpg", ".jpeg"]
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {', '.join(allowed_types)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Extract text based on file type
    if file_ext == ".pdf":
        extracted_text = extract_text_from_pdf(content)
    else:
        # For images, we use Gemini's vision capability
        extracted_text = await gemini.extract_text_from_image(content)
    
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the uploaded file"
        )
    
    # Interpret using Gemini 3
    interpretation = await gemini.simplify_lab_report(extracted_text)
    
    # Build response
    response_data = {
        "filename": file.filename,
        "extracted_text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
        "interpretation": interpretation["simplified"],
        "results": interpretation.get("results", []),
        "overall_summary": interpretation.get("summary", ""),
        "questions_for_doctor": interpretation.get("questions", [])
    }
    
    # Save to JSON file if patient_id provided
    if patient_id:
        report_storage = get_report_storage()
        report_id = report_storage.save_report(patient_id, response_data)
        response_data["report_id"] = report_id
        response_data["saved"] = True
    else:
        response_data["saved"] = False
    
    return response_data


@router.get("/{patient_id}/reports")
async def get_patient_reports(patient_id: str) -> List[dict]:
    """Get all stored reports for a patient."""
    report_storage = get_report_storage()
    reports = report_storage.get_patient_reports(patient_id)
    return reports


@router.get("/{patient_id}/reports/{report_id}")
async def get_patient_report(patient_id: str, report_id: str):
    """Get a specific report by ID."""
    report_storage = get_report_storage()
    report = report_storage.get_report(patient_id, report_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.delete("/{patient_id}/reports/{report_id}")
async def delete_patient_report(patient_id: str, report_id: str):
    """Delete a specific report."""
    report_storage = get_report_storage()
    deleted = report_storage.delete_report(patient_id, report_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"success": True, "message": "Report deleted"}


@router.post("/interpret-text")
async def interpret_report_text(text: str):
    """
    Interpret lab report text directly (for testing).
    """
    if not text or len(text) < 10:
        raise HTTPException(
            status_code=400,
            detail="Please provide valid lab report text"
        )
    
    interpretation = await gemini.simplify_lab_report(text)
    
    return {
        "interpretation": interpretation["simplified"],
        "results": interpretation.get("results", []),
        "overall_summary": interpretation.get("summary", "")
    }

