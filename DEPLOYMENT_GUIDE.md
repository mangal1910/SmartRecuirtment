# Cloud Deployment Guide (Free Tier)

This guide will walk you through deploying your **Smart Recruitment** project for free using **Vercel** (Frontend), **Render** (Backend & ML Service), and **MongoDB Atlas** (Database).

> [!IMPORTANT]
> You will need to create free accounts on [Vercel](https://vercel.com), [Render](https://render.com), and [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

## 1. Database Deployment (MongoDB Atlas)

1.  Log in to **MongoDB Atlas**.
2.  Create a **New Cluster** (select the free **Shared** tier, e.g., Sandbox).
3.  Go to **Database Access** -> Create a new user (Note the username and password).
4.  Go to **Network Access** -> Add IP Address -> **Allow Access from Anywhere** (`0.0.0.0/0`).
5.  Go to **Database** -> **Connect** -> **Drivers** -> Copy the connection string.
    *   It looks like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<password>` with your actual password.

---

## 2. ML Service Deployment (Render)

1.  Log in to **Render**.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Select the `ml-service` folder as the **Root Directory**.
5.  **Settings**:
    *   **Name**: `smart-recruitment-ml`
    *   **Runtime**: **Python 3**
    *   **Build Command**: `pip install -r requirements.txt && python -m spacy download en_core_web_md`
    *   **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6.  Click **Create Web Service**.
7.  **Copy the URL** provided by Render (e.g., `https://smart-recruitment-ml.onrender.com`).

---

## 3. Backend Deployment (Render)

1.  Click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  Select the `backend` folder as the **Root Directory**.
4.  **Settings**:
    *   **Name**: `smart-recruitment-backend`
    *   **Runtime**: **Node**
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables** (Advanced):
    *   `MONGODB_URI`: Paste your MongoDB Atlas connection string.
    *   `JWT_SECRET`: Enter a random secret key.
    *   `ML_SERVICE_URL`: Paste the **ML Service URL** from Step 2.
    *   `PORT`: `10000` (Render default) or just leave it, Render sets it automatically.
6.  Click **Create Web Service**.
7.  **Copy the URL** provided by Render (e.g., `https://smart-recruitment-backend.onrender.com`).

---

## 4. Frontend Deployment (Vercel)

1.  Make sure you have pushed your latest code to GitHub.
2.  Log in to **Vercel**.
3.  Click **Add New...** -> **Project**.
4.  Import your GitHub repository.
5.  **Framework Preset**: Select **Create React App**.
6.  **Root Directory**: Click "Edit" and select `frontend`.
7.  **Environment Variables**:
    *   `REACT_APP_API_URL`: Paste the **Backend URL** from Step 3 (add `/api` at the end, e.g., `https://smart-recruitment-backend.onrender.com/api`).
8.  Click **Deploy**.

---

## 5. Final Configuration

1.  Go back to your **Backend Service** on Render.
2.  Add a new Environment Variable:
    *   `FRONTEND_URL`: Paste your **Vercel Frontend URL** (e.g., `https://smart-recruitment-frontend.vercel.app`).
    *   (This ensures CORS only allows your frontend to connect).

---

## Troubleshooting

*   **Build Failures**: Check the logs in Render/Vercel.
*   **Connection Errors**: Ensure "Allow Access from Anywhere" is enabled in MongoDB Atlas Network Access.
*   **CORS Errors**: Verify the `FRONTEND_URL` and `REACT_APP_API_URL` match exactly (no trailing slashes unless expected).
