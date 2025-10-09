const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseCode: { type: String, required: true }, 
    s3Key: { type: String, required: true, unique: true }, 
    fileUrl: { type: String, required: true },
    uploaderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    downloadCount: { type: Number, default: 0 }, 
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' }, 
}, { timestamps: true }); 

module.exports = mongoose.model('Resource', resourceSchema);