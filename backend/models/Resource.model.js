const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  university: { type: String, required: true, trim: true },
  resourceType: { 
    type: String, 
    enum: ['Lecture Notes', 'Past Papers', 'Assignments', 'Tutorials', 'Other'], 
    required: true 
  },
  fileUrl: { type: String, required: true },
  s3Key: { type: String },
  uploaderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downloadCount: { type: Number, default: 0 },
  creditCost: { type: Number, default: 5, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'approved' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

resourceSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

resourceSchema.methods.upvote = function(userId) {
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

resourceSchema.methods.downvote = function(userId) {
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

module.exports = mongoose.model('Resource', resourceSchema);