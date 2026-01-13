"""
PDF Service
Handles PDF text extraction for lab reports.
"""
import fitz  # PyMuPDF
from io import BytesIO


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from a PDF file.
    
    Args:
        pdf_bytes: PDF file content as bytes
        
    Returns:
        Extracted text from all pages
    """
    try:
        # Open PDF from bytes
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
        print(f"Error extracting PDF text: {e}")
        return ""


def extract_tables_from_pdf(pdf_bytes: bytes) -> list[list[str]]:
    """
    Extract tables from a PDF file.
    Useful for lab reports with tabular data.
    
    Args:
        pdf_bytes: PDF file content as bytes
        
    Returns:
        List of tables, each as a list of rows
    """
    try:
        pdf_stream = BytesIO(pdf_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
        
        tables = []
        
        for page in doc:
            # Get tables from page
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
