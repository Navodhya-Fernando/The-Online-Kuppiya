const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  content: { type: String, required: true },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'deleted'], 
    default: 'active' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

answerSchema.virtual('voteScore').get(function() {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

answerSchema.methods.upvote = function(userId) {
  const userIdStr = userId.toString();
  const upvoteIndex = this.upvotes.findIndex(id => id.toString() === userIdStr);
  const downvoteIndex = this.downvotes.findIndex(id => id.toString() === userIdStr);
  
  if (downvoteIndex > -1) {
    this.downvotes.splice(downvoteIndex, 1);
  }
  
  if (upvoteIndex === -1) {
    this.upvotes.push(userId);
  } else {
    this.upvotes.splice(upvoteIndex, 1);
  }
  
  return this.save();
};

answerSchema.methods.downvote = function(userId) {
  const userIdStr = userId.toString();
  const upvoteIndex = this.upvotes.findIndex(id => id.toString() === userIdStr);
  const downvoteIndex = this.downvotes.findIndex(id => id.toString() === userIdStr);
  
  if (upvoteIndex > -1) {
    this.upvotes.splice(upvoteIndex, 1);
  }
  
  if (downvoteIndex === -1) {
    this.downvotes.push(userId);
  } else {
    this.downvotes.splice(downvoteIndex, 1);
  }
  
  return this.save();
};

module.exports = mongoose.model('Answer', answerSchema);