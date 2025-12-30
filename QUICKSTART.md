# 🚀 Quick Start Guide - Smart Recruitment System

## Prerequisites Checklist
- [ ] Node.js installed (v14+)
- [ ] Python installed (v3.8+)
- [ ] MongoDB Atlas account created OR local MongoDB running
- [ ] 3 Terminal windows ready

## Step-by-Step Setup (15 minutes)

### ⚡ Step 1: MongoDB Atlas Setup (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a cluster (M0 Free tier)
4. Go to "Database Access" → Add Database User
   - Username: `smartrecruit`
   - Password: (create a strong password)
   - User Privileges: "Atlas admin"
5. Go to "Network Access" → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://smartrecruit:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 📝 Step 2: Configure Backend (.env file)

1. Navigate to `backend` folder
2. Open `.env` file
3. Replace the MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://smartrecruit:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-recruitment?retryWrites=true&w=majority
   ```
   ⚠️ Replace `YOUR_PASSWORD` and the cluster URL with your actual values!

### 🐍 Step 3: Python ML Service Setup (5 minutes)

Open **Terminal 1**:
```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install packages (this takes 3-5 minutes)
pip install fastapi uvicorn python-multipart PyPDF2 pdfplumber python-docx spacy scikit-learn numpy pandas

# Download Spacy model (100MB, takes 1-2 minutes)
python -m spacy download en_core_web_md

# Start ML service
uvicorn app:app --reload --port 8000
```

✅ You should see: `Application startup complete.`
✅ ML Service running at: http://localhost:8000

### 💻 Step 4: Start Backend Server

Open **Terminal 2**:
```bash
cd backend

# Install dependencies (if not done yet)
npm install

# Start server
npm run dev
```

✅ You should see: `Server is running on port 5000` and `MongoDB Connected Successfully`
✅ Backend running at: http://localhost:5000

### ⚛️ Step 5: Start Frontend

Open **Terminal 3**:
```bash
cd frontend

# Start React app
npm start
```

✅ Browser should automatically open to: http://localhost:3000

---

## 🎯 Testing the Application (10 minutes)

### Test Scenario 1: Admin Creates Job & Reviews Resumes

1. **Register as Admin**
   - Go to http://localhost:3000/register
   - Name: `HR Manager`
   - Email: `hr@company.com`
   - Password: `password123`
   - Role: **Admin/HR**
   - Click "Register"

2. **Create a Job Posting**
   - You'll be redirected to Admin Dashboard
   - Click **"+ Create Job"**
   - Fill in:
     - Title: `Full Stack Developer`
     - Description: `We are looking for an experienced full stack developer to join our team`
     - Requirements: `React, Node.js, MongoDB, JavaScript, TypeScript, Express, Python, REST APIs`
     - Location: `Remote`
     - Job Type: `Full-time`
   - Click **"Create Job"**

### Test Scenario 2: Applicant Applies with Resume

3. **Open Incognito/Private Window** (or use a different browser)
   - Go to http://localhost:3000/register
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Role: **Applicant**
   - Click "Register"

4. **Create a Test Resume**
   - Open Microsoft Word or Google Docs
   - Create a simple resume with:
   ```
   John Doe
   Full Stack Developer
   
   SKILLS:
   - React.js - 3 years
   - Node.js - 3 years  
   - MongoDB - 2 years
   - JavaScript/TypeScript
   - REST APIs
   - Express.js
   
   EXPERIENCE:
   Software Engineer at Tech Company
   - Built web applications using React and Node.js
   - Designed MongoDB database schemas
   - Created REST APIs with Express
   ```
   - Save as **john_resume.pdf** or **john_resume.docx**

5. **Apply to the Job**
   - In applicant dashboard, click **"Apply Now"** on Full Stack Developer job
   - Upload the resume you just created
   - Click **"Submit Application"**
   - You should see: "Application submitted successfully!"

### Test Scenario 3: Admin Reviews and Manages Resumes

6. **Switch back to Admin window** (HR Manager)
   - Click **"View Applications"** on the Full Stack Developer job
   - You should see John Doe's application with a **match score** (likely 60-80%)
   - The score is calculated by AI based on keyword matching!

7. **Test Drag-and-Drop Pipeline**
   - Try dragging John's resume card from "Applied" to "Interviewing"
   - Then drag to "Hired" or "Rejected"
   - Each drag updates the status in the database!

8. **Verify Status Update** (Switch to Applicant window)
   - Click on **"My Applications"** tab
   - You should see the updated status (Interviewing/Hired/Rejected)

### Test Scenario 4: Multiple Applicants with Different Scores

9. **Create Another Test Resume** (Low Match Score)
   - Create a new resume with unrelated skills:
   ```
   Jane Smith
   Graphic Designer
   
   SKILLS:
   - Adobe Photoshop
   - Illustrator
   - Figma
   - UI/UX Design
   ```
   - Register another applicant and upload this resume
   - Compare match scores in admin dashboard
   - The Full Stack resume should score much higher than Design resume!

---

## ✅ Success Checklist

- [ ] MongoDB Atlas connected (no connection errors in backend terminal)
- [ ] ML Service running (http://localhost:8000/health shows "ok")
- [ ] Backend API running (http://localhost:5000/api/health works)
- [ ] Frontend loads (http://localhost:3000)
- [ ] Can register as Admin
- [ ] Can create job postings
- [ ] Can register as Applicant
- [ ] Can upload resume (PDF or DOCX)
- [ ] Match score appears (0-100)
- [ ] Can drag resumes between status columns
- [ ] Status changes reflect in applicant's view

---

## 🐛 Common Issues & Solutions

### Issue 1: "MongoDB Connection Error"
**Solution**: Check your MongoDB Atlas connection string in `backend/.env`
- Make sure you replaced `<password>` with your actual password
- Make sure you whitelisted IP 0.0.0.0/0 in Network Access
- Check cluster is active (not paused)

### Issue 2: "ML Service not responding"
**Solution**: 
```bash
# Make sure Spacy model is installed
cd ml-service
venv\Scripts\activate
python -m spacy download en_core_web_md
```

### Issue 3: "Match score is 0%"
**Possible causes**:
- ML service not running (check Terminal 1)
- File upload failed (check backend terminal for errors)
- Resume file is empty or corrupted

### Issue 4: Frontend won't start
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue 5: Port already in use
**Solutions**:
- Backend (5000): Change PORT in `backend/.env`
- ML Service (8000): Use `uvicorn app:app --reload --port 8001`
- Frontend (3000): It will auto-suggest port 3001

---

## 📊 Understanding Match Scores

The AI calculates match scores using 4 factors:

1. **TF-IDF Similarity (30%)**: How relevant are resume terms?
2. **Semantic Similarity (25%)**: Does resume meaning match job?
3. **Skill Matching (30%)**: Which skills match?
4. **Keyword Density (15%)**: How many job keywords appear?

**Score Ranges**:
- 70-100% = Excellent match (green)
- 50-69% = Good match (yellow/orange)
- 0-49% = Poor match (red)

---

## 🎓 Next Steps

Now that everything is working:

1. **Create more realistic job postings** with detailed requirements
2. **Test with real resumes** (PDF format works best)
3. **Explore the drag-and-drop** to manage hiring pipeline
4. **Check applicant view** to see how candidates track their status
5. **Experiment with different resumes** to see how scores change

---

## 💡 Pro Tips

- **Best Resume Format**: PDF with clear sections (Skills, Experience, Education)
- **Better Scores**: More keyword overlap = higher scores
- **Testing**: Use Ctrl+Shift+N (Chrome) for incognito mode to test as multiple users
- **Data Reset**: Delete database in MongoDB Atlas and restart backend to start fresh

---

**Happy Recruiting! 🎉**

Need help? Check the main README.md or common issues above.
