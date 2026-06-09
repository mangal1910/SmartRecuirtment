# Smart Recruitment System

A hybrid Full Stack + Machine Learning application that enables HR teams to screen, score, and rank resumes using NLP-powered matching algorithms. This system automates the recruitment pipeline, mapping candidates to job roles based on technical skill compatibility and semantic similarity.

## 🌟 Features

- **Role-Based Access Control**: Separate dashboards for Admins (HR) and Applicants.
- **AI-Powered Resume Matching**: NLP-based scoring using TF-IDF, semantic similarity (via Word Vectors), skill extraction, and keyword density.
- **Intelligent File Parsing**: Automated text extraction from PDF, DOCX, and DOC resumes.
- **Cloud-Based Resume Storage**: Integrated with **Cloudinary** for secure, scalable resume hosting (files are processed locally by the ML service, uploaded directly to Cloudinary, and local temp files are immediately purged).
- **Interactive Status Pipeline**: Drag-and-drop Kanban interface for managing candidate recruitment status (Applied → Interviewing → Rejected → Hired).
- **Real-time Match Scores**: Visual scoring indicators showing compatibility levels with job requirements.
- **Modern UI/UX**: Premium responsive design with smooth animations and notification feedback.

---

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** (Mongoose ODM)
- **Cloudinary SDK** (Cloud storage integration)
- **JWT** for secure stateless authentication
- **Multer** for handling local file stream uploads

### ML Microservice
- **FastAPI** (Python 3)
- **SpaCy** (NLP processing & entity matching)
- **Scikit-learn** (Similarity scoring and TF-IDF vectors)
- **PyPDF2 & pdfplumber** (PDF document text extraction)
- **python-docx** (Word document text extraction)

### Frontend
- **React.js** (functional components & context API)
- **React Router** (declarative client-side routing)
- **@hello-pangea/dnd** (Kanban drag-and-drop features)
- **Axios** (promise-based HTTP client)
- **React Toastify** (interactive UI notifications)

---

## 📋 Prerequisites

Before setting up the project, make sure you have installed:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (Local Community Server or MongoDB Atlas cluster connection URI)
- **Cloudinary** account (free tier works perfectly)

---

## 🚀 Installation & Setup

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd "Smart Recruitment"
```

### 2. Backend Setup (Node.js)

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create/edit the `.env` file in the `backend/` directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart-recruitment
   JWT_SECRET=your_jwt_secret_key_here
   ML_SERVICE_URL=http://localhost:8000
   PORT=5000

   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`*

### 3. ML Microservice Setup (Python)

1. Open a new terminal and navigate to the `ml-service/` directory:
   ```bash
   cd ml-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the SpaCy language model:
   ```bash
   python -m spacy download en_core_web_md
   ```
5. Start the ML FastAPI microservice:
   ```bash
   uvicorn app:app --reload --port 8000
   ```
   *The service runs on `http://localhost:8000`*

### 4. Frontend Setup (React)

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the React development server:
   ```bash
   npm start
   ```
   *The client opens automatically at `http://localhost:3000`. By default, it connects to the backend API at `http://localhost:5000/api`.*

---

## 📁 Project Structure

```
Smart Recruitment/
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── config/          # Centralized Configuration Modules
│   │   │   ├── db.js        # MongoDB connection setup & env check
│   │   │   └── cloudinary.js# Cloudinary initialization & SDK export
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── models/          # Mongoose Schemas (User, Job, Resume)
│   │   ├── routes/          # Express API route endpoints
│   │   └── utils/           # ML service connection handler
│   ├── uploads/             # Multer temporary buffer folder
│   ├── server.js            # Server entry point
│   └── package.json
│
├── ml-service/              # Python FastAPI Microservice
│   ├── utils/
│   │   ├── text_extractor.py # Document parsers
│   │   └── resume_matcher.py # NLP scoring engine
│   ├── temp_uploads/        # Temporary extraction buffer
│   ├── app.py               # API endpoints & server config
│   └── requirements.txt
│
└── frontend/                # React UI Application
    ├── src/
    │   ├── components/      # UI widgets and inputs
    │   ├── context/         # AuthContext and AuthProvider
    │   ├── pages/           # Admin/Applicant Dashboards & Auth pages
    │   └── services/        # Axios API configurations
    └── package.json
```

---

## 🔑 Environment Variables Reference

| Component | Variable | Description |
| :--- | :--- | :--- |
| **Backend** | `MONGODB_URI` | MongoDB Connection URL |
| **Backend** | `JWT_SECRET` | Secret key for signing Auth tokens |
| **Backend** | `PORT` | Local server port (Default: `5000`) |
| **Backend** | `ML_SERVICE_URL` | Microservice URL (Default: `http://localhost:8000`) |
| **Backend** | `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name |
| **Backend** | `CLOUDINARY_API_KEY` | Cloudinary API Key |
| **Backend** | `CLOUDINARY_API_SECRET`| Cloudinary API Secret Key |

---

## 📖 Usage Guide

### Admin / HR Dashboard
1. Register as an Admin/HR (role selection dropdown).
2. Log in and create job postings by filling out titles, requirements, and descriptions.
3. Click **View Applications** on any job card to view applicants ranked by their NLP score.
4. Drag and drop applicants between stage columns: **Applied**, **Interviewing**, **Rejected**, and **Hired**.

### Applicant Dashboard
1. Register as an Applicant.
2. Browse available job postings.
3. Click **Apply Now** and upload your PDF/DOCX resume.
4. Go to **My Applications** to view matching scores, application dates, and current status updates.

---

## 🎯 NLP Resume Matching Logic
The ML matching engine scores candidate profiles using a weighted vector similarity schema:
1. **TF-IDF Keyword Similarity (30%)**: Calculates keyword matching using word frequency metrics.
2. **Semantic Word Vector Similarity (25%)**: Evaluates conceptual overlap using SpaCy's medium word vectors (`en_core_web_md`).
3. **Targeted Skill Extraction (30%)**: Matches skill vectors directly against required job posting profiles.
4. **Keyword Density (15%)**: Ensures specialized terms are properly weighted.

---

## 🐛 Troubleshooting & FAQs

### Backend server fails to start
- Verify that `MONGODB_URI` contains a valid connection string in the backend `.env` file.
- Verify that all three `CLOUDINARY_` parameters are correctly copied.
- Ensure that port `5000` is free.

### "EADDRINUSE: address already in use :::5000"
- The backend port `5000` is locked by a zombie process or an active instance. Run the following in command line to free it:
  - **Windows**: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force`
  - **Mac/Linux**: `kill -9 $(lsof -t -i:5000)`

### Registration returns 400 Bad Request
- Registration yields a 400 if you attempt to register with an **email that is already present** in the database. 
- Try logging in with the email instead, or register with a new test email.

### Login returns 401 Unauthorized
- A 401 response means either the email does not exist, or the password you entered was incorrect. Double-check your login details.

### Frontend API connection issues
- The React application is configured to connect to `http://localhost:5000/api` by default. There is no need to configure a `.env` in the frontend.
