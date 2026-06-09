import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { resumesAPI, jobsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './JobResumes.css';

const JobResumes = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [resumes, setResumes] = useState({
        applied: [],
        interviewing: [],
        rejected: [],
        hired: []
    });
    const [loading, setLoading] = useState(true);
    const [rejectThreshold, setRejectThreshold] = useState(50);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        try {
            const [resumesRes, jobRes] = await Promise.all([
                resumesAPI.getJobResumes(jobId),
                jobsAPI.getJob(jobId)
            ]);

            setJob(jobRes.data.data);

            // Organize resumes by status
            const organized = {
                applied: [],
                interviewing: [],
                rejected: [],
                hired: []
            };

            resumesRes.data.data.forEach(resume => {
                organized[resume.status].push(resume);
            });

            setResumes(organized);
        } catch (error) {
            toast.error('Failed to fetch resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        // If dropped in same place, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;
        const resumeId = draggableId;

        // Update UI optimistically
        const newResumes = { ...resumes };
        const [movedResume] = newResumes[sourceStatus].splice(source.index, 1);
        movedResume.status = destStatus;
        newResumes[destStatus].splice(destination.index, 0, movedResume);
        setResumes(newResumes);

        // Update backend
        try {
            await resumesAPI.updateResumeStatus(resumeId, destStatus);
            toast.success(`Moved to ${destStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
            // Revert on error
            fetchData();
        }
    };

    const handleStatusUpdate = async (resumeId, newStatus) => {
        try {
            await resumesAPI.updateResumeStatus(resumeId, newStatus);
            toast.success(`Updated status to ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleBulkReject = async () => {
        if (!window.confirm(`Are you sure you want to reject all 'Applied' candidates with a score below ${rejectThreshold}?`)) {
            return;
        }

        setBulkActionLoading(true);
        try {
            const res = await resumesAPI.rejectByThreshold(jobId, rejectThreshold);
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to perform bulk rejection');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="job-resumes-container">
            <div className="resumes-header">
                <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
                    ← Back to Dashboard
                </button>
                <div className="job-info">
                    <h1>{job?.title}</h1>
                    <p>Total Applications: {Object.values(resumes).flat().length}</p>
                </div>
                <div className="bulk-actions">
                    <span className="bulk-label">Reject candidates below score:</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={rejectThreshold}
                        onChange={(e) => setRejectThreshold(e.target.value)}
                        className="threshold-input"
                    />
                    <button
                        onClick={handleBulkReject}
                        className="btn btn-danger btn-sm"
                        disabled={bulkActionLoading}
                    >
                        {bulkActionLoading ? 'Processing...' : 'Bulk Reject'}
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="pipeline-container">
                    {['applied', 'interviewing', 'rejected', 'hired'].map(status => (
                        <div key={status} className="pipeline-column">
                            <div className="column-header">
                                <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                                <span className="count">{resumes[status].length}</span>
                            </div>

                            <Droppable droppableId={status}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`resume-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                    >
                                        {resumes[status].length === 0 ? (
                                            <p className="empty-column">No applications</p>
                                        ) : (
                                            resumes[status].map((resume, index) => (
                                                <Draggable
                                                    key={resume._id}
                                                    draggableId={resume._id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`resume-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                                        >
                                                            <div className="resume-card-header">
                                                                <h4>{resume.applicantName}</h4>
                                                                <div
                                                                    className="match-score"
                                                                    style={{ backgroundColor: getScoreColor(resume.matchScore) }}
                                                                >
                                                                    {resume.matchScore}%
                                                                </div>
                                                            </div>
                                                            <p className="applicant-email">{resume.applicantEmail}</p>
                                                            <p className="file-name">📄 {resume.fileName}</p>
                                                            <div className="score-bar">
                                                                <div
                                                                    className="score-fill"
                                                                    style={{
                                                                        width: `${resume.matchScore}%`,
                                                                        backgroundColor: getScoreColor(resume.matchScore)
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <p className="upload-date">
                                                                {new Date(resume.uploadedAt).toLocaleDateString()}
                                                            </p>

                                                            <div className="card-actions">
                                                                {status === 'applied' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(resume._id, 'interviewing')}
                                                                            className="btn-action btn-interview"
                                                                            title="Invite to Interview"
                                                                        >
                                                                            Invite
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(resume._id, 'rejected')}
                                                                            className="btn-action btn-reject"
                                                                            title="Reject"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {status === 'interviewing' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(resume._id, 'hired')}
                                                                            className="btn-action btn-hire"
                                                                            title="Hire"
                                                                        >
                                                                            Hire
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(resume._id, 'rejected')}
                                                                            className="btn-action btn-reject"
                                                                            title="Reject"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default JobResumes;
