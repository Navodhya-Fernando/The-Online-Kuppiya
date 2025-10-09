const Resource = require('../models/Resource.model');
const User = require('../models/User.model');

// @desc    List all approved resources with sorting
// @route   GET /api/resources
exports.listResources = async (req, res) => {
    try {
        const { sortBy = 'votes', resourceType, course } = req.query;
        
        // Build filter
        let filter = { status: 'approved' };
        if (resourceType && resourceType !== 'All') {
            filter.resourceType = resourceType;
        }
        if (course) {
            filter.courseCode = new RegExp(course, 'i');
        }

        // Build sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'popular':
                sortOptions = { downloadCount: -1 };
                break;
            case 'votes':
            default:
                // Sort by vote score (upvotes - downvotes)
                sortOptions = { upvotes: -1, downvotes: 1 };
                break;
        }

        const resources = await Resource.find(filter)
            .populate('uploaderId', 'firstName lastName')
            .sort(sortOptions)
            .limit(50); // Limit for performance

        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Error fetching resources.' });
    }
};

// @desc    Get single resource details
// @route   GET /api/resources/:id
exports.getResourceDetails = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploaderId', 'firstName lastName email');

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Increment view count (optional)
        resource.viewCount = (resource.viewCount || 0) + 1;
        await resource.save();

        res.status(200).json(resource);
    } catch (error) {
        console.error('Error fetching resource details:', error);
        res.status(500).json({ message: 'Error fetching resource details.' });
    }
};

// @desc    Vote on a resource (upvote/downvote)
// @route   POST /api/resources/:id/vote
exports.voteResource = async (req, res) => {
    try {
        const { voteType } = req.body; // 'up' or 'down'
        const resourceId = req.params.id;
        const userId = req.user._id;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user already voted (prevent duplicate voting)
        // This is simplified - in production, use a separate Votes collection
        if (voteType === 'up') {
            resource.upvotes += 1;
            
            // Award credits to uploader
            const uploader = await User.findById(resource.uploaderId);
            if (uploader) {
                uploader.credits = (uploader.credits || 0) + 5;
                await uploader.save();
            }
        } else if (voteType === 'down') {
            resource.downvotes += 1;
        }

        await resource.save();

        res.status(200).json({
            message: 'Vote recorded successfully',
            upvotes: resource.upvotes,
            downvotes: resource.downvotes,
            score: resource.upvotes - resource.downvotes
        });
    } catch (error) {
        console.error('Error voting on resource:', error);
        res.status(500).json({ message: 'Error recording vote.' });
    }
};

// @desc    Download resource (increment counter & deduct credits)
// @route   POST /api/resources/:id/download
exports.downloadResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const user = await User.findById(userId);
        
        // Check if user has enough credits (cost: 2 credits per download)
        const downloadCost = 2;
        if ((user.credits || 0) < downloadCost && resource.uploaderId.toString() !== userId.toString()) {
            return res.status(400).json({ 
                message: `Insufficient credits. You need ${downloadCost} credits to download this resource.`,
                required: downloadCost,
                current: user.credits || 0
            });
        }

        // Deduct credits (unless downloading own file)
        if (resource.uploaderId.toString() !== userId.toString()) {
            user.credits = (user.credits || 0) - downloadCost;
            await user.save();
        }

        // Increment download count
        resource.downloadCount = (resource.downloadCount || 0) + 1;
        await resource.save();

        res.status(200).json({
            message: 'Download authorized',
            fileUrl: resource.fileUrl,
            creditsRemaining: user.credits
        });
    } catch (error) {
        console.error('Error processing download:', error);
        res.status(500).json({ message: 'Error processing download.' });
    }
};

// @desc    Delete own resource
// @route   DELETE /api/resources/:id
exports.deleteResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user owns the resource or is admin
        if (resource.uploaderId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
        }

        await Resource.findByIdAndDelete(resourceId);

        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Error deleting resource.' });
    }
};

// @desc    Upload new resource
// @route   POST /api/resources/upload
exports.uploadResource = async (req, res) => {
    try {
        const { title, description, courseCode, resourceType, institute } = req.body;
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }

        // Create resource record
        const resource = await Resource.create({
            title,
            description,
            courseCode: courseCode || 'GENERAL',
            resourceType,
            institute,
            s3Key: req.file.key || req.file.filename,
            fileUrl: req.file.location || req.file.path,
            uploaderId: userId,
            status: 'approved' // Auto-approve for now
        });

        // Award credits to uploader
        const user = await User.findById(userId);
        user.credits = (user.credits || 0) + 10; // 10 credits per upload
        user.uploadCount = (user.uploadCount || 0) + 1;
        await user.save();

        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource,
            creditsEarned: 10,
            totalCredits: user.credits
        });
    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).json({ message: 'Error uploading resource.' });
    }
};

// @desc    Get user's uploaded resources
// @route   GET /api/resources/my-uploads
exports.getMyResources = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const resources = await Resource.find({ uploaderId: userId })
            .sort({ createdAt: -1 });

        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching user resources:', error);
        res.status(500).json({ message: 'Error fetching your resources.' });
    }
};