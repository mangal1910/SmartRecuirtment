import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: 'Remote',
        jobType: 'full-time'
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await jobsAPI.getAllJobs();
            setJobs(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await jobsAPI.createJob(formData);
            toast.success('Job created successfully!');
            setShowCreateForm(false);
            setFormData({
                title: '',
                description: '',
                requirements: '',
                location: 'Remote',
                jobType: 'full-time'
            });
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create job');
        }
    };

    const handleViewResumes = (jobId) => {
        navigate(`/admin/jobs/${jobId}/resumes`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Smart Recruitment - Admin</h1>
                <div className="nav-right">
                    <span className="user-name">Welcome, {user.name}</span>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Job Postings</h2>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn btn-primary"
                    >
                        {showCreateForm ? 'Cancel' : '+ Create Job'}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="create-job-form">
                        <h3>Create New Job</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Job Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Senior Software Engineer"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    placeholder="Describe the role..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Requirements</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    placeholder="List required skills and experience..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Remote, Hybrid, or City"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Job Type</label>
                                    <select name="jobType" value={formData.jobType} onChange={handleChange}>
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary">Create Job</button>
                        </form>
                    </div>
                )}

                <div className="jobs-grid">
                    {jobs.length === 0 ? (
                        <p className="no-jobs">No jobs posted yet. Create your first job!</p>
                    ) : (
                        jobs.map(job => (
                            <div key={job._id} className="job-card">
                                <div className="job-card-header">
                                    <h3>{job.title}</h3>
                                    <span className={`badge badge-${job.status}`}>{job.status}</span>
                                </div>
                                <p className="job-description">{job.description.substring(0, 150)}...</p>
                                <div className="job-meta">
                                    <span>📍 {job.location}</span>
                                    <span>💼 {job.jobType}</span>
                                </div>
                                <button
                                    onClick={() => handleViewResumes(job._id)}
                                    className="btn btn-outline"
                                >
                                    View Applications
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
