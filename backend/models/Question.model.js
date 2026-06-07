const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  body: { type: String, required: true },
  courseCode: { type: String, required: true, trim: true },
  tags: [{ type: String, lowercase: true, trim: true, maxlength: 20 }],
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  answerCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  acceptedAnswerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Answer', 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['open', 'closed', 'answered'], 
    default: 'open' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

questionSchema.virtual('voteScore').get(function() {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

questionSchema.methods.upvote = function(userId) {
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

questionSchema.methods.downvote = function(userId) {
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

module.exports = mongoose.model('Question', questionSchema);