# 🚀 How to Run Smart Recruitment Application

This guide shows you how to start and use the Smart Recruitment System.

---

## ⚡ Quick Start (3 Easy Steps)

### Prerequisites
- ✅ MongoDB Atlas connection string in `backend/.env`
- ✅ All dependencies installed (npm packages and Python packages)

### Starting the Application

You need to open **3 separate terminal/command prompt windows** and run these commands:

#### Terminal 1️⃣: Start ML Service
```bash
cd "c:\Z data\class study\Project_By_Google_Antigravity\Smart Recruitment\ml-service"
venv\Scripts\activate
uvicorn app:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### Terminal 2️⃣: Start Backend Server
```bash
cd "c:\Z data\class study\Project_By_Google_Antigravity\Smart Recruitment\backend"
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected Successfully
🚀 Server is running on port 5000
📍 API: http://localhost:5000/api
💚 Health Check: http://localhost:5000/api/health
```

#### Terminal 3️⃣: Start Frontend
```bash
cd "c:\Z data\class study\Project_By_Google_Antigravity\Smart Recruitment\frontend"
npm start
```

**Expected output:**
```
webpack compiled with 1 warning
Compiled successfully!

You can now view frontend in the browser.
  Local:            http://localhost:3000
```

> 💡 **Tip**: The browser should automatically open to `http://localhost:3000`

---

## ✅ Verify Everything is Running

Open these URLs in your browser to check:

1. **Frontend**: http://localhost:3000 ✅ (Should show login page)
2. **Backend Health**: http://localhost:5000/api/health ✅ (Should show JSON response)
3. **ML Service Health**: http://localhost:8000/health ✅ (Should show status: ok)

---

## 👤 Using the Application

### As Admin (HR Manager)

1. **Register as Admin**
   - Go to http://localhost:3000/register
   - Fill in your details
   - Select role: **Admin/HR**
   - Click Register

2. **Create Job Postings**
   - After login, you'll be on the Admin Dashboard
   - Click **"+ Create Job"**
   - Fill in:
     - Job Title
     - Description
     - Requirements (list skills needed)
     - Location
     - Job Type
   - Click **"Create Job"**

3. **View Applications**
   - Click **"View Applications"** on any job card
   - See all applicants with their **match scores** (0-100%)
   - Resumes are automatically ranked by score!

4. **Manage Candidates** (Drag & Drop)
   - Drag resume cards between columns:
     - **Applied** → **Interviewing** → **Hired** or **Rejected**
   - Status updates automatically save

### As Applicant (Job Seeker)

1. **Register as Applicant**
   - Go to http://localhost:3000/register
   - Fill in your details
   - Select role: **Applicant**
   - Click Register

2. **Browse Jobs**
   - After login, you'll see all available jobs
   - Read job descriptions and requirements

3. **Apply to Jobs**
   - Click **"Apply Now"** on any job
   - Upload your resume (PDF or DOCX)
   - Click **"Submit Application"**
   - You'll get a **match score** immediately!

4. **Track Your Applications**
   - Click the **"My Applications"** tab
   - See all your applications with:
     - Match scores
     - Current status (Applied/Interviewing/Hired/Rejected)
     - Application dates

---

## 🎯 Test Scenario (Complete Workflow)

### Step 1: Create Admin Account
```
Email: hr@company.com
Password: admin123
Role: Admin/HR
```

### Step 2: Post a Job
```
Title: Full Stack Developer
Description: Looking for MERN stack developer
Requirements: React, Node.js, MongoDB, Express, JavaScript
Location: Remote
Type: Full-time
```

### Step 3: Create Applicant Account (Use incognito window)
```
Email: john@example.com
Password: pass123
Role: Applicant
```

### Step 4: Apply with Resume
- Upload a resume mentioning: React, Node.js, MongoDB, JavaScript
- Check your match score (should be 60-80% if skills match!)

### Step 5: Review as Admin
- Switch back to admin window
- View applications for "Full Stack Developer"
- See applicant ranked by match score
- Drag to "Interviewing" status

### Step 6: Check Status as Applicant
- Go to "My Applications" tab
- Status should show "Interviewing"

---

## 🛑 Stopping the Application

To stop all services:

1. **In each terminal window**, press `Ctrl + C`
2. Wait for each service to shutdown gracefully
3. Close the terminal windows

---

## 🔄 Restarting the Application

If you need to restart (e.g., after making code changes):

1. **Stop all services** (Ctrl + C in each terminal)
2. **Wait 5 seconds** for ports to be released
3. **Start services again** in the same order:
   - First: ML Service
   - Second: Backend
   - Third: Frontend

---

## 📝 Important Notes

### MongoDB Atlas Connection
From now on, make sure your `backend/.env` file has the correct MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-recruitment?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your actual values.

### Resume File Formats
- ✅ Supported: **PDF** and **DOCX**
- ❌ Not supported: Images, TXT, or other formats
- 📏 Maximum size: **5MB** per file

### Match Score Algorithm
The AI calculates scores using:
- **30%** - Keyword matching (TF-IDF)
- **25%** - Semantic similarity (meaning)
- **30%** - Skill extraction & matching
- **15%** - Keyword density

**Score Guide:**
- 🟢 70-100% = Excellent match
- 🟡 50-69% = Good match
- 🔴 0-49% = Poor match

---

## 🐛 Common Issues

### Issue 1: "Port 5000 already in use"
**Solution**: Another process is using port 5000
```bash
# Windows: Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### Issue 2: "MongoDB connection failed"
**Solutions**:
- ✅ Check internet connection
- ✅ Verify MongoDB Atlas connection string in `.env`
- ✅ Make sure you whitelisted IP: 0.0.0.0/0 in Atlas
- ✅ Check username/password are correct

### Issue 3: Frontend won't start
**Solution**: Clear cache and reinstall
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue 4: ML Service error "Spacy model not found"
**Solution**: Download the model
```bash
cd ml-service
venv\Scripts\activate
python -m spacy download en_core_web_md
```

---

## 💡 Pro Tips

1. **Keep terminals organized**: Label each terminal window (ML, Backend, Frontend)
2. **Use different browsers**: Test admin in Chrome, applicant in Edge/Firefox
3. **Save test resumes**: Create a folder with sample PDFs for quick testing
4. **Monitor logs**: Watch the terminal outputs to see API calls in real-time
5. **Use incognito mode**: Easy way to test as different users without logging out

---

## 📚 Next Steps

Now that you know how to run it:

1. ✅ Create realistic job postings
2. ✅ Test with your actual resume
3. ✅ Try different resumes to compare scores
4. ✅ Experiment with the drag-and-drop pipeline
5. ✅ Share with friends to test multi-user scenarios

---

## 🎉 You're All Set!

Your Smart Recruitment System is ready to use. Enjoy recruiting smarter with AI! 🚀

**Need help?** Check the [QUICKSTART.md](file:///c:/Z%20data/class%20study/Project_By_Google_Antigravity/Smart%20Recruitment/QUICKSTART.md) or [README.md](file:///c:/Z%20data/class%20study/Project_By_Google_Antigravity/Smart%20Recruitment/README.md) for more details.
