"""
Reports Router
Handles lab report upload and interpretation for patients.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.gemini_service import GeminiService
from app.services.pdf_service import extract_text_from_pdf

router = APIRouter()
gemini = GeminiService()


@router.post("/upload-and-interpret")
async def upload_and_interpret_report(file: UploadFile = File(...)):
    """
    Upload a lab report and get plain-language interpretation.
    This is the PATIENT-FACING feature.
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
    
    return {
        "filename": file.filename,
        "extracted_text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
        "interpretation": interpretation["simplified"],
        "results": interpretation.get("results", []),
        "overall_summary": interpretation.get("summary", ""),
        "questions_for_doctor": interpretation.get("questions", [])
    }


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
