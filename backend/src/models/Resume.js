const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicantName: {
        type: String,
        required: true
    },
    applicantEmail: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
        default: ''
    },
    matchScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['applied', 'interviewing', 'rejected', 'hired'],
        default: 'applied'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index to prevent duplicate applications
resumeSchema.index({ applicantId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Resume', resumeSchema);
