const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { protect, isAdmin, isApplicant } = require('../middleware/auth');
const { analyzeResume } = require('../utils/mlService');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept pdf and docx files only
    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/resumes/upload
// @desc    Upload resume for a job
// @access  Applicant only
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file'
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user already applied to this job
        const existingResume = await Resume.findOne({
            applicantId: req.user._id,
            jobId: jobId
        });

        if (existingResume) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Prepare job description for ML analysis
        const jobDescription = `${job.title}. ${job.description}. ${job.requirements}`;

        // Send to ML service for analysis
        const mlResult = await analyzeResume(req.file.path, jobDescription);

        // Create resume record
        const resume = await Resume.create({
            applicantId: req.user._id,
            jobId: jobId,
            applicantName: req.user.name,
            applicantEmail: req.user.email,
            fileName: req.file.originalname,
            filePath: req.file.path,
            extractedText: mlResult.data.extracted_text || '',
            matchScore: mlResult.data.match_score || 0
        });

        res.status(201).json({
            success: true,
            message: 'Resume uploaded and analyzed successfully',
            data: {
                id: resume._id,
                fileName: resume.fileName,
                matchScore: resume.matchScore,
                status: resume.status
            }
        });
    } catch (error) {
        // Clean up uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('Upload resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume',
            error: error.message
        });
    }
});

// @route   GET /api/resumes/job/:jobId
// @desc    Get all resumes for a specific job (Admin)
// @access  Admin only
router.get('/job/:jobId', protect, isAdmin, async (req, res) => {
    try {
        const resumes = await Resume.find({ jobId: req.params.jobId })
            .populate('applicantId', 'name email')
            .sort({ matchScore: -1 }); // Sort by match score (highest first)

        res.json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resumes',
            error: error.message
        });
    }
});

// @route   GET /api/resumes/my
// @desc    Get applicant's own resumes
// @access  Applicant only
router.get('/my', protect, async (req, res) => {
    try {
        const resumes = await Resume.find({ applicantId: req.user._id })
            .populate('jobId', 'title description')
            .sort({ uploadedAt: -1 });

        res.json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        console.error('Get my resumes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your resumes',
            error: error.message
        });
    }
});

// @route   POST /api/resumes/job/:jobId/reject-threshold
// @desc    Bulk reject candidates below a certain score
// @access  Admin only
router.post('/job/:jobId/reject-threshold', protect, isAdmin, async (req, res) => {
    try {
        const { threshold } = req.body;
        const { jobId } = req.params;

        if (threshold === undefined || threshold === null) {
            return res.status(400).json({
                success: false,
                message: 'Threshold score is required'
            });
        }

        const result = await Resume.updateMany(
            {
                jobId: jobId,
                matchScore: { $lt: threshold },
                status: 'applied' // Only reject those currently in 'applied' stage
            },
            {
                $set: { status: 'rejected' }
            }
        );

        res.json({
            success: true,
            message: `Successfully rejected ${result.modifiedCount} candidates below score ${threshold}`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Bulk reject error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk rejection',
            error: error.message
        });
    }
});

// @route   PUT /api/resumes/:id/status
// @desc    Update resume status (for drag-and-drop pipeline)
// @access  Admin only
router.put('/:id/status', protect, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['applied', 'interviewing', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        resume.status = status;
        await resume.save();

        res.json({
            success: true,
            message: 'Resume status updated successfully',
            data: resume
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating resume status',
            error: error.message
        });
    }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume details
// @access  Admin or Owner
router.get('/:id', protect, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id)
            .populate('applicantId', 'name email')
            .populate('jobId', 'title description requirements');

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check if user is admin or the applicant
        if (req.user.role !== 'admin' && resume.applicantId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resume',
            error: error.message
        });
    }
});

module.exports = router;
