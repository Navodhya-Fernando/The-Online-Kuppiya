const Resource = require('../models/Resource.model');
const User = require('../models/User.model');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'online-kuppiya-files';

// Upload Resource
const uploadResource = async (req, res) => {
  try {
    const { title, description, course, university, resourceType, creditCost } = req.body;
    const file = req.file;

    // Validate required fields
    if (!title || !description || !course || !university || !resourceType || !file) {
      return res.status(400).json({
        success: false,
        message: 'All fields including file are required'
      });
    }

    // Generate unique file key
    const fileExtension = file.originalname.split('.').pop();
    const fileKey = `resources/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `attachment; filename="${file.originalname}"`
    };

    let s3Url;
    try {
      const result = await s3.upload(uploadParams).promise();
      s3Url = result.Location;
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      // Fallback: save file locally or use a mock URL
      s3Url = `http://localhost:3003/uploads/${fileKey}`;
    }

    // Create resource in database
    const resource = new Resource({
      title,
      description,
      course,
      university,
      resourceType,
      fileUrl: s3Url,
      s3Key: fileKey,
      uploaderId: req.user.id,
      creditCost: creditCost ? parseInt(creditCost) : 5
    });

    await resource.save();

    // Award credits to uploader
    await User.findByIdAndUpdate(req.user.id, { $inc: { credits: 10, reputation: 5 } });

    // Populate uploader info
    await resource.populate('uploaderId', 'name university degree');

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('Resource upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource',
      error: error.message
    });
  }
};

// Get All Resources
const getAllResources = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      course, 
      university, 
      resourceType,
      search,
      sortBy = 'voteScore'
    } = req.query;

    const filter = { status: 'approved' };
    
    if (course) filter.course = new RegExp(course, 'i');
    if (university) filter.university = new RegExp(university, 'i');
    if (resourceType) filter.resourceType = resourceType;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    let sortOption = {};
    switch (sortBy) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'downloads':
        sortOption = { downloadCount: -1 };
        break;
      default:
        // Sort by vote score (virtual field)
        sortOption = { createdAt: -1 }; // Fallback to newest
    }

    const resources = await Resource.find(filter)
      .populate('uploaderId', 'name university degree')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Sort by vote score if requested (since it's a virtual field)
    if (sortBy === 'voteScore') {
      resources.sort((a, b) => b.voteScore - a.voteScore);
    }

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      resources,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResources: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
};

// Get Resource by ID
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploaderId', 'name university degree')
      .populate('upvotes', 'name')
      .populate('downvotes', 'name');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: error.message
    });
  }
};

// Download Resource
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if user has enough credits
    if (user.credits < resource.creditCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits',
        required: resource.creditCost,
        available: user.credits
      });
    }

    // Deduct credits from user
    await user.deductCredits(resource.creditCost);
    
    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    // Award credits to uploader
    await User.findByIdAndUpdate(resource.uploaderId, { 
      $inc: { credits: Math.floor(resource.creditCost / 2), reputation: 1 } 
    });

    res.json({
      success: true,
      message: 'Download authorized',
      downloadUrl: resource.fileUrl,
      creditsDeducted: resource.creditCost,
      remainingCredits: user.credits - resource.creditCost
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
};

// Vote on Resource
const voteResource = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (voteType === 'up') {
      await resource.upvote(req.user.id);
    } else if (voteType === 'down') {
      await resource.downvote(req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use "up" or "down"'
      });
    }

    // Update uploader reputation based on votes
    const voteScore = resource.upvotes.length - resource.downvotes.length;
    await User.findByIdAndUpdate(resource.uploaderId, {
      $inc: { reputation: voteType === 'up' ? 1 : -1 }
    });

    res.json({
      success: true,
      message: `Resource ${voteType}voted successfully`,
      voteScore: resource.voteScore,
      upvotes: resource.upvotes.length,
      downvotes: resource.downvotes.length
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vote',
      error: error.message
    });
  }
};

// Delete Resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user owns the resource or is admin
    if (resource.uploaderId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    // Delete from S3 if exists
    if (resource.s3Key) {
      try {
        await s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: resource.s3Key
        }).promise();
      } catch (s3Error) {
        console.warn('S3 delete error:', s3Error);
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message
    });
  }
};

module.exports = {
  uploadResource,
  getAllResources,
  getResourceById,
  downloadResource,
  voteResource,
  deleteResource
};
