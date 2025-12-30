# Smart Recruitment System

A hybrid Full Stack + Machine Learning application that enables HR teams to efficiently screen and rank resumes using NLP-powered matching algorithms.

## 🌟 Features

- **Role-Based Access Control**: Separate dashboards for Admins (HR) and Applicants
- **AI-Powered Resume Matching**: NLP-based scoring using TF-IDF, semantic similarity, skill extraction, and keyword density
- **Intelligent File Parsing**: Extract text from PDF and DOCX resumes
- **Interactive Status Pipeline**: Drag-and-drop interface for managing candidate status (Applied → Interviewing → Rejected → Hired)
- **Real-time Match Scores**: Visual indicators showing how well candidates match job requirements
- **Modern UI/UX**: Responsive design with smooth animations and intuitive workflows

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **JWT** for authentication
- **Multer** for file uploads

### ML Microservice
- **FastAPI** (Python)
- **Spacy** for NLP processing
- **Scikit-learn** for similarity scoring
- **PyPDF2 & pdfplumber** for PDF extraction
- **python-docx** for Word document parsing

### Frontend
- **React.js** with Hooks
- **React Router** for navigation
- **@hello-pangea/dnd** for drag-and-drop
- **Axios** for API calls
- **React Toastify** for notifications

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB Atlas** account (free tier) OR local MongoDB installation
- **npm** or **yarn** package manager
- **pip** for Python packages

## 🚀 Installation & Setup

### 1. Clone the Repository (if applicable)
```bash
git clone <repository-url>
cd "Smart Recruitment"
```

### 2. Backend Setup (Node.js)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit the .env file and add your MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-recruitment?retryWrites=true&w=majority

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. ML Microservice Setup (Python)

```bash
# Open a new terminal
# Navigate to ml-service folder
cd ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download Spacy language model
python -m spacy download en_core_web_md

# Start the service
uvicorn app:app --reload --port 8000
```

The ML service will run on `http://localhost:8000`

### 4. Frontend Setup (React)

```bash
# Open a new terminal
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will open automatically at `http://localhost:3000`

## 🔑 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (choose free tier)
4. Create a database user with username and password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string and replace it in `backend/.env`:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/smart-recruitment?retryWrites=true&w=majority
```

## 📖 Usage Guide

### Admin/HR Workflow

1. **Register** as an admin at `/register` (select "Admin/HR" role)
2. **Login** to access the admin dashboard
3. **Create Job Postings**: Click "+ Create Job" and fill in job details
4. **View Applications**: Click "View Applications" on any job card
5. **Review Resumes**: See all applicants ranked by ML match score
6. **Manage Pipeline**: Drag and drop candidates between status columns:
   - Applied → Interviewing → Rejected → Hired

### Applicant Workflow

1. **Register** as an applicant at `/register` (select "Applicant" role)
2. **Login** to access the applicant dashboard
3. **Browse Jobs**: View all available job postings
4. **Apply**: Click "Apply Now" and upload your resume (PDF or DOCX)
5. **Track Status**: Switch to "My Applications" tab to see:
   - Application status (Applied, Interviewing, Rejected, or Hired)
   - Your match score for each job
   - Application date

## 🧪 Testing the Application

### Quick Test Workflow

1. **Start all three services** (Backend, ML Service, Frontend)
2. **Register as Admin**: Create an admin account
3. **Create a Job**: Post a job with specific requirements (e.g., "React, Node.js, MongoDB")
4. **Register as Applicant**: Open an incognito window or different browser
5. **Upload Resume**: Create a test resume with matching/non-matching skills
6. **Check Match Score**: Verify ML service returns appropriate scores
7. **Test Pipeline**: As admin, drag resumes through different status columns
8. **Verify Updates**: Check that status changes persist and are visible to applicants

## 📁 Project Structure

```
Smart Recruitment/
├── backend/              # Node.js Express Server
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── utils/       # ML service integration
│   ├── server.js
│   └── package.json
│
├── ml-service/          # Python FastAPI Microservice
│   ├── utils/
│   │   ├── text_extractor.py    # PDF/DOCX parsing
│   │   └── resume_matcher.py    # NLP matching
│   ├── app.py
│   └── requirements.txt
│
└── frontend/            # React Application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── context/     # Auth context
    │   └── services/    # API services
    └── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Jobs
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Admin only)
- `PUT /api/jobs/:id` - Update job (Admin only)
- `DELETE /api/jobs/:id` - Delete job (Admin only)

### Resumes
- `POST /api/resumes/upload` - Upload resume (Applicant)
- `GET /api/resumes/job/:jobId` - Get all resumes for a job (Admin)
- `GET /api/resumes/my` - Get applicant's own resumes
- `PUT /api/resumes/:id/status` - Update resume status (Admin)

### ML Service
- `POST /api/analyze-resume` - Analyze resume and return match score
- `GET /health` - Health check

## 🎯 Resume Matching Algorithm

The ML service uses a weighted scoring system:

- **TF-IDF Similarity (30%)**: Measures term frequency-inverse document frequency
- **Semantic Similarity (25%)**: Uses Spacy word vectors for meaning-based matching
- **Skill Matching (30%)**: Extracts and compares technical skills
- **Keyword Density (15%)**: Calculates presence of job description keywords

Final scores range from 0-100, with higher scores indicating better matches.

## 🐛 Troubleshooting

### Backend won't start
- Verify MongoDB connection string is correct
- Check if port 5000 is available
- Ensure all npm packages are installed

### ML Service errors
- Verify Spacy model is downloaded: `python -m spacy download en_core_web_md`
- Check Python version (requires 3.8+)
- Ensure virtual environment is activated

### Frontend issues
- Clear browser cache
- Check that backend and ML service are running
- Verify REACT_APP_API_URL in `.env` is correct

## 📝 Future Enhancements

- Email notifications for status changes
- Resume parsing improvements (experience, education extraction)
- Advanced filtering and search
- Bulk resume upload
- Interview scheduling
- Analytics dashboard
- Export reports to PDF/Excel

## 👥 Contributors

Developed as a project demonstrating Full Stack + Machine Learning integration.

## 📄 License

This project is for educational purposes.

---

**Happy Recruiting! 🎉**
