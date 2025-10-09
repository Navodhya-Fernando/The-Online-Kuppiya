const express = require('express');
const router = express.Router();
const upload = require('../config/s3'); 
const resourceController = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', resourceController.listResources);
router.get('/:id', resourceController.getResourceDetails);

// Protected routes (require authentication)
router.post('/upload', protect, upload.single('resourceFile'), resourceController.uploadResource);
router.post('/:id/vote', protect, resourceController.voteResource);
router.post('/:id/download', protect, resourceController.downloadResource);
router.get('/my/uploads', protect, resourceController.getMyResources);
router.delete('/:id', protect, resourceController.deleteResource);

module.exports = router;