const express = require('express');
const router = express.Router();
const upload = require('../config/s3'); 
const resourceController = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const Resource = require('../models/Resource.model'); // Added import

const TEST_USER_ID = '60f8b8a3e7b1c31f4c7d0d0c'; 

// POST /api/resources/upload - Protected route for file upload
router.post('/upload', protect, upload.single('resourceFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded or upload failed.' });
        }

        const newResource = new Resource({
            title: req.body.title, 
            description: req.body.description,
            courseCode: req.body.courseCode || 'GENERAL',
            s3Key: req.file.key,       
            fileUrl: req.file.location, 
            // Use authenticated user ID after 'protect' runs, fallback to TEST_USER_ID
            uploaderId: req.user ? req.user._id : TEST_USER_ID 
        });

        await newResource.save();

        res.status(201).send({
            message: 'Resource saved successfully to S3 and MongoDB!',
            resource: newResource
        });
        
    } catch (error) {
        console.error("Resource upload error:", error);
        res.status(500).send({ message: 'Failed to save resource.', error: error.message });
    }
});

// GET /api/resources - List all resources (Public access)
router.get('/', resourceController.listResources);

// GET /api/resources/:id - Get resource details (Public access)
router.get('/:id', resourceController.getResourceDetails);

// DELETE /api/resources/:id - Protected route for deleting a resource
router.delete('/:id', protect, resourceController.deleteResource);


module.exports = router;