const express = require('express');
const Job = require('../models/Job');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs',
            error: error.message
        });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job',
            error: error.message
        });
    }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Admin only
router.post('/', protect, isAdmin, async (req, res) => {
    try {
        const { title, description, requirements, location, jobType } = req.body;

        // Validate input
        if (!title || !description || !requirements) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and requirements'
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements,
            location,
            jobType,
            postedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: job
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating job',
            error: error.message
        });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Admin only
router.put('/:id', protect, isAdmin, async (req, res) => {
    try {
        const { title, description, requirements, status, location, jobType } = req.body;

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Update fields
        if (title) job.title = title;
        if (description) job.description = description;
        if (requirements) job.requirements = requirements;
        if (status) job.status = status;
        if (location) job.location = location;
        if (jobType) job.jobType = jobType;

        await job.save();

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: job
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating job',
            error: error.message
        });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Admin only
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        await job.deleteOne();

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting job',
            error: error.message
        });
    }
});

module.exports = router;
