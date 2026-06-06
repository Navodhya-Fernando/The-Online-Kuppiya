const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
    university: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: Number, required: true, min: 1, max: 6 },
    credits: { type: Number, default: 50, min: 0 },
    reputation: { type: Number, default: 0, min: 0 },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isApproved: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date, default: null },
  emailVerificationTokenHash: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  passwordResetTokenHash: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
    avatar: { type: String, default: '👤' },
    bio: { type: String, default: '', maxlength: 500 },
    joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addCredits = function(amount) {
  this.credits += amount;
  return this.save();
};

userSchema.methods.deductCredits = function(amount) {
  if (this.credits >= amount) {
    this.credits -= amount;
    return this.save();
  }
  throw new Error('Insufficient credits');
};

module.exports = mongoose.model('User', userSchema);