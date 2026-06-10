import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, resumesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [job, setJob] = useState(null);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const [jobRes, myResumesRes] = await Promise.all([
                jobsAPI.getJob(jobId),
                resumesAPI.getMyResumes()
            ]);

            setJob(jobRes.data.data);
            
            // Check if user has already applied to this job
            const applied = myResumesRes.data.data.some(app => app.jobId._id === jobId);
            setAlreadyApplied(applied);
        } catch (error) {
            toast.error('Failed to fetch job details');
            navigate('/applicant/dashboard');
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
            formData.append('jobId', jobId);

            await resumesAPI.uploadResume(formData);
            toast.success('Application submitted successfully!');
            setShowApplyModal(false);
            setResumeFile(null);
            fetchJobDetails(); // Refresh application status
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

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    if (!job) {
        return <div className="loading-container"><p>Job not found</p></div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1 onClick={() => navigate('/applicant/dashboard')} style={{ cursor: 'pointer' }}>
                    Smart Recruitment
                </h1>
                <div className="nav-right">
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content" style={{ maxWidth: '800px' }}>
                <button onClick={() => navigate('/applicant/dashboard')} className="btn btn-secondary" style={{ marginBottom: '24px' }}>
                    ← Back to Jobs
                </button>

                <div className="job-card" style={{ cursor: 'default', padding: '32px' }}>
                    <div className="job-card-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '8px' }}>{job.title}</h2>
                            <div className="job-meta" style={{ margin: 0 }}>
                                <span>📍 {job.location}</span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>💼 {job.jobType}</span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>👥 Openings: {job.openings || 5}</span>
                            </div>
                        </div>
                        <span className={`badge badge-${job.status}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                            {job.status}
                        </span>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '10px' }}>Job Description</h3>
                        <p style={{ color: '#4b5563', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>

                    <div style={{ marginBottom: '32px', borderTop: '1px solid #f3f4f6', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '10px' }}>Requirements</h3>
                        <p style={{ color: '#4b5563', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setShowApplyModal(true)}
                            className={`btn ${alreadyApplied || job.status === 'closed' ? 'btn-disabled' : 'btn-primary'}`}
                            disabled={alreadyApplied || job.status === 'closed'}
                            style={{ padding: '12px 32px', fontSize: '16px' }}
                        >
                            {alreadyApplied 
                                ? 'Already Applied' 
                                : job.status === 'closed' 
                                    ? 'Applications Closed' 
                                    : 'Apply for this Position'
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {showApplyModal && (
                <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Apply to {job.title}</h2>
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
                                    onClick={() => setShowApplyModal(false)}
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

export default JobDetails;
