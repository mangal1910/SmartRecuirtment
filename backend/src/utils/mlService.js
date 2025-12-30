const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Send resume file to ML service for text extraction and scoring
 */
const analyzeResume = async (filePath, jobDescription) => {
    try {
        const FormData = require('form-data');
        const fs = require('fs');

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('job_description', jobDescription);

        const response = await axios.post(`${ML_SERVICE_URL}/api/analyze-resume`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 30000 // 30 seconds timeout
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('ML Service Error:', error.message);
        return {
            success: false,
            error: error.message,
            data: {
                extracted_text: '',
                match_score: 0
            }
        };
    }
};

/**
 * Check if ML service is available
 */
const checkMLServiceHealth = async () => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`, {
            timeout: 5000
        });
        return response.data.status === 'ok';
    } catch (error) {
        return false;
    }
};

module.exports = {
    analyzeResume,
    checkMLServiceHealth
};
