import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ApplicantDashboard from './pages/ApplicantDashboard';
import JobResumes from './pages/JobResumes';
import JobDetails from './pages/JobDetails';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/jobs/:jobId/resumes"
              element={
                <PrivateRoute requiredRole="admin">
                  <JobResumes />
                </PrivateRoute>
              }
            />

            {/* Applicant Routes */}
            <Route
              path="/applicant/dashboard"
              element={
                <PrivateRoute requiredRole="applicant">
                  <ApplicantDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/applicant/jobs/:jobId"
              element={
                <PrivateRoute requiredRole="applicant">
                  <JobDetails />
                </PrivateRoute>
              }
            />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
