const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const Sentry = require('@sentry/node');

const hasS3Config = process.env.AWS_S3_BUCKET_NAME && 
                   process.env.AWS_ACCESS_KEY_ID && 
                   process.env.AWS_SECRET_ACCESS_KEY && 
                   process.env.AWS_REGION;

let upload;

if (hasS3Config) {
    aws.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    const s3 = new aws.S3();

    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            key: function (req, file, cb) {
                cb(null, `student-ids/${Date.now()}-${file.originalname}`);
            }
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|pdf/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
            }
        }
    });
} else {
    console.log('S3 not configured, using local storage');
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join(__dirname, '../uploads/student-ids');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    upload = multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|pdf/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
            }
        }
    });
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.testEndpoint = (req, res) => {
    res.json({ message: 'Auth controller is working!', timestamp: new Date() });
};

exports.registerUser = [
    upload.single('studentIdFile'),
    async (req, res) => {
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

            if (!firstName || !lastName || !whatsappNumber || !email || !password || 
                !institute || !studentId || !degreeProgram || !level) {
                return res.status(400).json({ message: 'Please add all required fields' });
            }

            const userExists = await User.findOne({ 
                $or: [{ email }, { whatsappNumber }, { studentId }]
            });

            if (userExists) {
                return res.status(400).json({ 
                    message: 'User with this email, WhatsApp number, or Student ID already exists' 
                });
            }

            const user = await User.create({
                firstName,
                lastName,
                whatsappNumber,
                email,
                password,
                institute,
                studentId,
                studentIdFile: req.file ? (hasS3Config ? req.file.location : req.file.path) : 'no-file-uploaded',
                degreeProgram,
                level,
                emailVerified: false,
                whatsappVerified: false,
                approvalStatus: 'pending'
            });

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
            console.error('Registration error:', error.message);
            
            try {
                Sentry.setContext('registration_data', {
                    email: req.body?.email || 'not provided',
                    institute: req.body?.institute || 'not provided',
                    studentId: req.body?.studentId || 'not provided',
                    hasFile: !!req.file
                });
                Sentry.captureException(error);
            } catch (sentryError) {
                console.warn('Sentry error capture failed:', sentryError.message);
            }
            
            res.status(500).json({ 
                message: 'Registration failed. Please try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
];

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
        console.error('Login error:', error.message);
        
        try {
            Sentry.setContext('login_data', {
                email: req.body?.email || 'not provided',
                hasPassword: !!req.body?.password
            });
            Sentry.captureException(error);
        } catch (sentryError) {
            console.warn('Sentry error capture failed:', sentryError.message);
        }
        
        res.status(500).json({ 
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        res.json({ message: 'Password reset token generated', resetToken });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.approvalStatus = 'approved';
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();
        await user.save();

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectUser = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.approvalStatus = 'rejected';
        user.rejectionReason = rejectionReason;
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();
        await user.save();

        res.json({ message: 'User rejected successfully', user });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.testRegister = async (req, res) => {
    try {
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            whatsappNumber: `123456${Date.now()}`,
            institute: 'Test University',
            studentId: `ST${Date.now()}`,
            studentIdFile: 'test-file.jpg',
            degreeProgram: 'Computer Science',
            level: 'Undergraduate'
        };

        const user = await User.create(testUser);
        res.status(201).json({ message: 'Test user created', user: user._id });
    } catch (error) {
        console.error('Test register error:', error);
        res.status(500).json({ message: 'Test registration failed', error: error.message });
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pendingUsers = await User.find({ approvalStatus: 'pending' })
            .select('-password -resetPasswordToken')
            .sort({ createdAt: -1 });

        res.json({ users: pendingUsers });
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
                credits: user.credits || 0,
                uploadCount: user.uploadCount || 0,
                institute: user.institute,
                degreeProgram: user.degreeProgram,
                level: user.level,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logoutUser = (req, res) => {
    res.json({ message: 'Logout successful' });
};
