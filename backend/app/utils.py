"""
Utility functions for the resume agent API.
"""

import PyPDF2
from io import BytesIO
from typing import Optional

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Extract text content from PDF bytes.
    
    Args:
        pdf_content: PDF file content as bytes
        
    Returns:
        Extracted text content as string
        
    Raises:
        ValueError: If PDF processing fails
    """
    try:
        with BytesIO(pdf_content) as pdf_stream:
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
            
            if not text_content.strip():
                raise ValueError("No text content found in PDF")
                
            return text_content.strip()
        
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def validate_job_description(job_description: str) -> str:
    """
    Validate and clean job description text.
    
    Args:
        job_description: Raw job description text
        
    Returns:
        Cleaned job description text
        
    Raises:
        ValueError: If job description is invalid
    """
    if not job_description or not job_description.strip():
        raise ValueError("Job description cannot be empty")
    
    cleaned_text = job_description.strip()
    
    if len(cleaned_text) < 50:
        raise ValueError("Job description too short (minimum 50 characters)")
    
    return cleaned_text