// backend/controllers/auth.controller.js
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const fs = require('fs');

// Check if S3 configuration is available
const hasS3Config = process.env.AWS_S3_BUCKET_NAME && 
                   process.env.AWS_ACCESS_KEY_ID && 
                   process.env.AWS_SECRET_ACCESS_KEY && 
                   process.env.AWS_REGION;

let upload;

if (hasS3Config) {
    // S3 Configuration for student ID uploads
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        signatureVersion: 'v4' 
    });

    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            acl: 'private', // Keep student IDs private
            metadata: function (req, file, cb) {
                cb(null, { 
                    fieldName: file.fieldname,
                    uploadType: 'student-id',
                    originalName: file.originalname 
                });
            },
            key: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fileName = `student-ids/student-id-${uniqueSuffix}${path.extname(file.originalname)}`;
                cb(null, fileName);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        }
    });

    console.log('✅ S3 configured for student ID uploads');
} else {
    // Local file storage fallback
    console.log('⚠️  S3 not configured, using local storage for student IDs');
    
    const uploadDir = 'uploads/student-ids/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`📁 Created directory: ${uploadDir}`);
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'student-id-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    upload = multer({ 
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        }
    });
}

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Simplified registration - OTP verification removed



// TEST endpoint to verify connection works
exports.testEndpoint = (req, res) => {
    console.log('✅ TEST ENDPOINT HIT - Basic connection works!');
    res.json({ message: 'Backend connection successful!' });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = [
    // Remove multer temporarily to test without file upload
    // upload.single('studentIdFile'),
    async (req, res) => {
        console.log('🔥 REGISTRATION ENDPOINT HIT!');
        console.log('📋 Request method:', req.method);
        console.log('📋 Request headers:', req.headers);
        console.log('📋 Request body keys:', Object.keys(req.body || {}));
        console.log('📋 Has file?:', !!req.file);
        
        try {
            const {
                firstName,
                lastName,
                whatsappNumber,
                email,
                password,
                institute,
                studentId,
                degreeProgram,
                level
            } = req.body;
            
            console.log('📝 Extracted form data:', {
                firstName,
                lastName,
                email: email ? email.substring(0, 5) + '...' : 'undefined',
                hasPassword: !!password,
                institute,
                studentId
            });

            // Validation
            if (!firstName || !lastName || !whatsappNumber || !email || !password || 
                !institute || !studentId || !degreeProgram || !level) {
                return res.status(400).json({ message: 'Please add all required fields' });
            }

            console.log('📁 File upload status (temporarily disabled):', {
                hasFile: !!req.file,
                fileInfo: req.file ? 'File present' : 'No file (OK for testing)'
            });

            // Temporarily disable file requirement for testing
            // if (!req.file) {
            //     return res.status(400).json({ message: 'Student ID file is required' });
            // }

            // OTP verification removed - Student ID verification provides sufficient authentication

            console.log('🔍 Checking for existing user with:', { email, whatsappNumber, studentId });

            // Check if user exists
            const userExists = await User.findOne({ 
                $or: [{ email }, { whatsappNumber }, { studentId }]
            });

            if (userExists) {
                console.log('⚠️ User already exists:', userExists.email);
                return res.status(400).json({ 
                    message: 'User with this email, WhatsApp number, or Student ID already exists' 
                });
            }

            console.log('✅ No existing user found, proceeding with creation');

            const user = await User.create({
                firstName,
                lastName,
                whatsappNumber,
                email,
                password,
                institute,
                studentId,
                studentIdFile: req.file ? (hasS3Config ? req.file.location : req.file.path) : 'temp-no-file', // Temporary for testing
                degreeProgram,
                level,
                emailVerified: false, // Will be verified through admin approval process
                whatsappVerified: false, // Will be verified through admin approval process
                approvalStatus: 'pending'
            });

            // No session cleanup needed since we removed OTP verification

            // Send notification to admins about new registration (disabled for now)
            console.log('📧 Admin notification: Disabled for testing - Registration successful');

            res.status(201).json({
                message: 'Registration submitted successfully! Your request is pending approval.',
                user: {
                    _id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    approvalStatus: user.approvalStatus
                }
            });
        } catch (error) {
            console.error('🚨 REGISTRATION ERROR CAUGHT!');
            console.error('🚨 Error message:', error.message);
            console.error('🚨 Error stack:', error.stack);
            console.error('🚨 Full error object:', error);
            
            res.status(500).json({ 
                message: 'Registration failed. Please try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
];

// @desc    Authenticate a user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is approved
        if (user.approvalStatus === 'pending') {
            return res.status(403).json({ 
                message: 'Your account is pending approval. You can download files but cannot upload or use the Q&A forum yet.',
                approvalStatus: 'pending'
            });
        }

        if (user.approvalStatus === 'rejected') {
            return res.status(403).json({ 
                message: `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}`,
                approvalStatus: 'rejected'
            });
        }

        const token = generateToken(user._id);
        
        res.json({
            user: {
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
                credits: user.credits || 0,
                uploadCount: user.uploadCount || 0
            },
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
};

// @desc    Forgot password - send recovery link
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { method, identifier } = req.body; // method: 'email' or 'whatsapp'

        if (!method || !identifier) {
            return res.status(400).json({ message: 'Method and identifier are required' });
        }

        let user;
        if (method === 'email') {
            user = await User.findOne({ email: identifier });
        } else if (method === 'whatsapp') {
            user = await User.findOne({ whatsappNumber: identifier });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        if (method === 'email') {
            const emailHtml = `
                <h2>Password Reset Request - The Online Kuppiya</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="color: #007bff; text-decoration: none;">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 30 minutes.</p>
            `;
            console.log('📧 Password reset email would be sent to:', user.email);
        } else {
            const message = `Password reset request for The Online Kuppiya. Click: ${resetUrl} (Expires in 30 mins)`;
            await sendWhatsApp(user.whatsappNumber, message);
        }

        res.json({ message: `Recovery link sent to your ${method}` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send recovery link' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Hash the token and find user
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

// @desc    Approve user registration
// @route   PUT /api/auth/approve-user/:userId
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminUser = req.user; // From auth middleware

        if (adminUser.role !== 'admin' && adminUser.role !== 'moderator') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.approvalStatus = 'approved';
        user.approvedBy = adminUser._id;
        user.approvedAt = new Date();
        await user.save();

        // Approval notification (email service removed)
        console.log('✅ User approved:', user.email);

        res.json({ message: 'User approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve user' });
    }
};

// @desc    Reject user registration
// @route   PUT /api/auth/reject-user/:userId
exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminUser = req.user; // From auth middleware

        if (adminUser.role !== 'admin' && adminUser.role !== 'moderator') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.approvalStatus = 'rejected';
        user.rejectionReason = reason || 'No specific reason provided';
        user.approvedBy = adminUser._id;
        user.approvedAt = new Date();
        await user.save();

        // Send rejection notification
        // Rejection notification (email service removed)
        console.log('❌ User rejected:', user.email, 'Reason:', user.rejectionReason);

        res.json({ message: 'User rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject user' });
    }
};

// @desc    Test user creation (for debugging)
// @route   POST /api/auth/test-register
exports.testRegister = async (req, res) => {
    try {
        const user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test-debug@example.com',
            password: 'password123',
            whatsappNumber: '+94771234567',
            institute: 'NIBM',
            studentId: 'TEST001',
            studentIdFile: 'test-file-path',
            degreeProgram: 'Test Program',
            level: '1st Year',
            approvalStatus: 'pending'
        });
        
        res.status(201).json({ message: 'Test user created', userId: user._id });
    } catch (error) {
        console.error('Test registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending users for approval
// @route   GET /api/auth/pending-users
exports.getPendingUsers = async (req, res) => {
    try {
        const adminUser = req.user; // From auth middleware

        if (adminUser.role !== 'admin' && adminUser.role !== 'moderator') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const pendingUsers = await User.find({ approvalStatus: 'pending' })
            .select('-password -resetPasswordToken -emailOtp -whatsappOtp')
            .sort({ createdAt: -1 });

        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending users' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            credits: user.credits || 0,
            uploadCount: user.uploadCount || 0,
            whatsappNumber: user.whatsappNumber,
            institute: user.institute,
            degreeProgram: user.degreeProgram,
            level: user.level
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

// @desc    Logout user (client-side handles token removal)
// @route   GET /api/auth/logout
exports.logoutUser = (req, res) => {
    // For JWT, server-side logout typically does nothing or clears an http-only cookie
    // Since we are storing the token client-side for now, this is just a confirmation endpoint.
    res.status(200).json({ message: 'Logged out successfully' });
};