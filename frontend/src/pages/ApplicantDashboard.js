import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, resumesAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const ApplicantDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs');
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, myResumesRes] = await Promise.all([
                jobsAPI.getAllJobs(),
                resumesAPI.getMyResumes()
            ]);
            setJobs(jobsRes.data.data);
            setMyApplications(myResumesRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload PDF or DOCX file');
                return;
            }
            setResumeFile(file);
        }
    };

    const handleApply = (job) => {
        // Check if already applied
        const alreadyApplied = myApplications.some(app => app.jobId._id === job._id);
        if (alreadyApplied) {
            toast.info('You have already applied to this job');
            return;
        }
        setSelectedJob(job);
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            toast.error('Please select a resume file');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('jobId', selectedJob._id);

            await resumesAPI.uploadResume(formData);
            toast.success('Application submitted successfully!');
            setSelectedJob(null);
            setResumeFile(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'applied': return 'badge-info';
            case 'interviewing': return 'badge-warning';
            case 'hired': return 'badge-success';
            case 'rejected': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Smart Recruitment - Applicant</h1>
                <div className="nav-right">
                    <span className="user-name">Welcome, {user.name}</span>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('jobs')}
                    >
                        Available Jobs
                    </button>
                    <button
                        className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        My Applications ({myApplications.length})
                    </button>
                </div>

                {activeTab === 'jobs' && (
                    <div className="jobs-grid">
                        {jobs.length === 0 ? (
                            <p className="no-jobs">No jobs available at the moment.</p>
                        ) : (
                            jobs.map(job => {
                                const alreadyApplied = myApplications.some(app => app.jobId._id === job._id);
                                return (
                                    <div key={job._id} className="job-card">
                                        <div className="job-card-header">
                                            <h3>{job.title}</h3>
                                            <span className={`badge badge-${job.status}`}>{job.status}</span>
                                        </div>
                                        <p className="job-description">{job.description}</p>
                                        <div className="job-requirements">
                                            <strong>Requirements:</strong>
                                            <p>{job.requirements.substring(0, 100)}...</p>
                                        </div>
                                        <div className="job-meta">
                                            <span>📍 {job.location}</span>
                                            <span>💼 {job.jobType}</span>
                                        </div>
                                        <button
                                            onClick={() => handleApply(job)}
                                            className={`btn ${alreadyApplied ? 'btn-disabled' : 'btn-primary'}`}
                                            disabled={alreadyApplied}
                                        >
                                            {alreadyApplied ? 'Already Applied' : 'Apply Now'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="applications-list">
                        {myApplications.length === 0 ? (
                            <p className="no-applications">You haven't applied to any jobs yet.</p>
                        ) : (
                            myApplications.map(app => (
                                <div key={app._id} className={`application-card status-${app.status}`}>
                                    <div className="application-header">
                                        <div>
                                            <h3>{app.jobId.title}</h3>
                                            <p className="job-description">{app.jobId.description.substring(0, 100)}...</p>
                                        </div>
                                        <div className="status-container">
                                            {app.status === 'hired' && <span className="status-banner hired">🎉 HIRED</span>}
                                            {app.status === 'rejected' && <span className="status-banner rejected">❌ REJECTED</span>}
                                            <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="application-details">
                                        <div className="detail-item">
                                            <strong>Match Score:</strong>
                                            <div className="score-display">
                                                <span className="score-value">{app.matchScore}%</span>
                                                <div className="score-bar-small">
                                                    <div
                                                        className="score-fill-small"
                                                        style={{ width: `${app.matchScore}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Applied:</strong> {new Date(app.uploadedAt).toLocaleDateString()}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Resume:</strong> {app.fileName}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            {selectedJob && (
                <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Apply to {selectedJob.title}</h2>
                        <form onSubmit={handleSubmitApplication}>
                            <div className="form-group">
                                <label>Upload Resume (PDF or DOCX)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc"
                                    onChange={handleFileChange}
                                    required
                                />
                                {resumeFile && (
                                    <p className="file-selected">Selected: {resumeFile.name}</p>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setSelectedJob(null)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantDashboard;
