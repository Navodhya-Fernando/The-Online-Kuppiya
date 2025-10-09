const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Must be installed: npm install bcryptjs --prefix backend

const userSchema = new mongoose.Schema({
    // Basic authentication fields
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    
    // Personal information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true },
    
    // Academic information
    institute: { type: String, required: true },
    studentId: { type: String, required: true },
    studentIdFile: { type: String, required: true }, // File path or S3 URL
    degreeProgram: { type: String, required: true },
    level: { type: String, required: true },
    
    // Verification status
    emailVerified: { type: Boolean, default: false },
    whatsappVerified: { type: Boolean, default: false },
    
    // Approval system
    approvalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    approvedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    
    // System fields
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    credits: { type: Number, default: 0 },
    uploadCount: { type: Number, default: 0 },
    
    // Password reset tokens
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);