const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const fs = require('fs');

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
            key: (req, file, cb) => cb(null, `student-ids/${Date.now()}-${file.originalname}`)
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowed = /jpeg|jpg|png|pdf/;
            const ext = allowed.test(path.extname(file.originalname).toLowerCase());
            const mime = allowed.test(file.mimetype);
            cb(null, mime && ext);
        }
    });
} else {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    });

    upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowed = /jpeg|jpg|png|pdf/;
            const ext = allowed.test(path.extname(file.originalname).toLowerCase());
            const mime = allowed.test(file.mimetype);
            cb(null, mime && ext);
        }
    });
}

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = [
    upload.single('studentIdFile'),
    async (req, res) => {
        try {
            const { firstName, lastName, whatsappNumber, email, password, institute, studentId, degreeProgram, level } = req.body;

            if (!firstName || !lastName || !whatsappNumber || !email || !password || !institute || !studentId || !degreeProgram || !level) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const existingUser = await User.findOne({
                $or: [{ email }, { whatsappNumber }, { studentId }]
            });

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email, phone, or student ID' });
            }

            const userData = {
                firstName,
                lastName,
                whatsappNumber,
                email,
                password,
                institute,
                studentId,
                degreeProgram,
                level
            };

            if (req.file) {
                userData.studentIdFile = hasS3Config ? req.file.location : req.file.path;
            }

            const user = await User.create(userData);

            res.status(201).json({
                success: true,
                message: 'Registration successful! Your account is pending approval.',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    approvalStatus: user.approvalStatus
                }
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }
];

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.approvalStatus !== 'approved') {
            return res.status(403).json({ 
                message: `Account ${user.approvalStatus}. Please wait for admin approval.`,
                approvalStatus: user.approvalStatus
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus
            },
            token
        });

    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
};

exports.logout = (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get profile' });
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        if (!['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find({ approvalStatus: 'pending' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get pending users' });
    }
};

exports.approveUser = async (req, res) => {
    try {
        if (!['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            {
                approvalStatus: 'approved',
                approvedBy: req.user._id,
                approvedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, message: 'User approved', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve user' });
    }
};

exports.rejectUser = async (req, res) => {
    try {
        if (!['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { reason } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            {
                approvalStatus: 'rejected',
                rejectionReason: reason,
                approvedBy: req.user._id,
                approvedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, message: 'User rejected', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject user' });
    }
};
