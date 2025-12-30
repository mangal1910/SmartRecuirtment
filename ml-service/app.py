from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
from datetime import datetime

from utils.text_extractor import extract_text
from utils.resume_matcher import matcher

app = FastAPI(
    title="Smart Recruitment ML Service",
    description="NLP-powered resume analysis and matching service",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")] if os.getenv("FRONTEND_URL") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for file processing
TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Smart Recruitment ML Service API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze": "/api/analyze-resume"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ML Resume Analyzer",
        "timestamp": datetime.now().isoformat(),
        "spacy_loaded": matcher.nlp is not None
    }


@app.post("/api/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Analyze resume and calculate match score against job description
    
    Parameters:
    - file: Resume file (PDF or DOCX)
    - job_description: Job description text
    
    Returns:
    - extracted_text: Text extracted from resume
    - match_score: Match score (0-100)
    """
    
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if not job_description:
        raise HTTPException(status_code=400, detail="Job description is required")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file temporarily
    temp_file_path = os.path.join(TEMP_DIR, f"{datetime.now().timestamp()}_{file.filename}")
    
    try:
        # Save file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text from resume
        extracted_text = extract_text(temp_file_path)
        
        if not extracted_text:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "Could not extract text from file",
                    "extracted_text": "",
                    "match_score": 0
                }
            )
        
        # Calculate match score
        match_score = matcher.calculate_match_score(extracted_text, job_description)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "match_score": match_score,
            "text_length": len(extracted_text)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing resume: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Error removing temp file: {e}")


@app.get("/api/test")
def test_matcher():
    """Test endpoint to verify ML matcher is working"""
    sample_resume = """
    John Doe
    Software Engineer
    
    Skills: Python, JavaScript, React, Node.js, MongoDB, Machine Learning
    
    Experience:
    - Developed web applications using React and Node.js
    - Built ML models for data analysis
    - Worked with MongoDB databases
    """
    
    sample_job = """
    Looking for a Software Engineer with expertise in Python, React, and MongoDB.
    Experience with Machine Learning is a plus.
    """
    
    score = matcher.calculate_match_score(sample_resume, sample_job)
    
    return {
        "success": True,
        "test_score": score,
        "message": "ML matcher is working properly" if score > 0 else "ML matcher may have issues"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
