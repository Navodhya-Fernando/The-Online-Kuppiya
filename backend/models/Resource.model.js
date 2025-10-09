const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseCode: { type: String, default: 'GENERAL' },
    resourceType: { type: String, enum: ['Lecture Note', 'Past Paper', 'Assignment', 'Other'], default: 'Other', required: true },
    institute: { type: String, default: 'NIBM' , required: true },
    s3Key: { type: String, required: true }, 
    fileUrl: { type: String, required: true },
    uploaderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true }); 

module.exports = mongoose.model('Resource', resourceSchema);