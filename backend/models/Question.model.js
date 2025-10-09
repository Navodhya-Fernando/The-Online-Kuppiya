const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    courseCode: { type: String, required: true, default: 'GENERAL' },
    tags: [{ type: String, lowercase: true, trim: true }],
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    answerCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    acceptedAnswerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Answer', 
        default: null 
    },
    status: { type: String, enum: ['active', 'closed', 'archived'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);