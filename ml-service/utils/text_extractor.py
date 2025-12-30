import PyPDF2
import pdfplumber
from docx import Document
import re


def extract_text_from_pdf(file_path):
    """
    Extract text from PDF file using pdfplumber (more reliable than PyPDF2)
    """
    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        return clean_text(text)
    except Exception as e:
        print(f"Error extracting PDF text with pdfplumber: {e}")
        # Fallback to PyPDF2
        return extract_text_from_pdf_pypdf2(file_path)


def extract_text_from_pdf_pypdf2(file_path):
    """
    Fallback PDF extraction using PyPDF2
    """
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        return clean_text(text)
    except Exception as e:
        print(f"Error extracting PDF text with PyPDF2: {e}")
        return ""


def extract_text_from_docx(file_path):
    """
    Extract text from DOCX file
    """
    try:
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return clean_text(text)
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""


def clean_text(text):
    """
    Clean and preprocess extracted text
    """
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep important ones
    text = re.sub(r'[^\w\s\.\,\-\(\)\@\#\+]', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def extract_text(file_path):
    """
    Main function to extract text based on file extension
    """
    file_path_lower = file_path.lower()
    
    if file_path_lower.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path_lower.endswith('.docx') or file_path_lower.endswith('.doc'):
        return extract_text_from_docx(file_path)
    else:
        return ""
