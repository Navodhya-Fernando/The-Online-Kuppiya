const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadResource, 
  getAllResources, 
  getResourceById, 
  downloadResource, 
  voteResource, 
  deleteResource 
} = require('../controllers/resource.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Public routes
router.get('/', getAllResources);
router.get('/:id', getResourceById);

// Protected routes
router.post('/upload', authenticateToken, upload.single('file'), uploadResource);
router.post('/:id/download', authenticateToken, downloadResource);
router.post('/:id/vote', authenticateToken, voteResource);
router.delete('/:id', authenticateToken, deleteResource);

module.exports = router;
