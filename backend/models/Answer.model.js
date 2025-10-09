const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Question', 
        required: true 
    },
    body: { type: String, required: true },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false }, // Critical for Q&A logic
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);