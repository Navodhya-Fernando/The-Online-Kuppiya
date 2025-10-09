const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Check if S3 configuration is available
const hasS3Config = process.env.AWS_S3_BUCKET_NAME && 
                   process.env.AWS_ACCESS_KEY_ID && 
                   process.env.AWS_SECRET_ACCESS_KEY && 
                   process.env.AWS_REGION;

let upload;

if (hasS3Config) {
    // S3 Configuration
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
            acl: 'private', 
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, `resources/${Date.now().toString()}-${file.originalname}`);
            }
        }),
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB limit
        }
    });
} else {
    // Local file storage fallback
    console.log('S3 not configured, using local storage');
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/resources/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    upload = multer({
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB limit
        }
    });
}

module.exports = upload;