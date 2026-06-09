import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials)
};

// Jobs API
export const jobsAPI = {
    getAllJobs: () => api.get('/jobs'),
    getJob: (id) => api.get(`/jobs/${id}`),
    createJob: (jobData) => api.post('/jobs', jobData),
    updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
    deleteJob: (id) => api.delete(`/jobs/${id}`)
};

// Resumes API
export const resumesAPI = {
    uploadResume: (formData) => {
        return api.post('/resumes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    getJobResumes: (jobId) => api.get(`/resumes/job/${jobId}`),
    getMyResumes: () => api.get('/resumes/my'),
    updateResumeStatus: (id, status) => api.put(`/resumes/${id}/status`, { status }),
    rejectByThreshold: (jobId, threshold) => api.post(`/resumes/job/${jobId}/reject-threshold`, { threshold }),
    getResume: (id) => api.get(`/resumes/${id}`)
};

export default api;
