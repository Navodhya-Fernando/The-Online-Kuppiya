// backend/scripts/setupS3.js
const aws = require('aws-sdk');

// Check if S3 configuration is available
const hasS3Config = process.env.AWS_S3_BUCKET_NAME && 
                   process.env.AWS_ACCESS_KEY_ID && 
                   process.env.AWS_SECRET_ACCESS_KEY && 
                   process.env.AWS_REGION;

if (!hasS3Config) {
    console.log('❌ S3 configuration missing. Please set environment variables:');
    console.log('   AWS_S3_BUCKET_NAME');
    console.log('   AWS_ACCESS_KEY_ID'); 
    console.log('   AWS_SECRET_ACCESS_KEY');
    console.log('   AWS_REGION');
    process.exit(1);
}

// S3 Configuration
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4'
});

async function setupS3Folders() {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    // Folders to create
    const folders = [
        'student-ids/',
        'resources/', 
        'profile-pictures/',
        'temp/'
    ];

    console.log(`🚀 Setting up S3 bucket structure in: ${bucketName}`);
    
    try {
        // Check if bucket exists
        await s3.headBucket({ Bucket: bucketName }).promise();
        console.log(`✅ Bucket ${bucketName} exists`);
    } catch (error) {
        console.log(`❌ Bucket ${bucketName} not accessible:`, error.message);
        return;
    }

    // Create folders by uploading empty objects
    for (const folder of folders) {
        try {
            await s3.putObject({
                Bucket: bucketName,
                Key: folder,
                Body: '',
                ContentType: 'application/x-directory'
            }).promise();
            
            console.log(`📁 Created folder: ${folder}`);
        } catch (error) {
            console.log(`❌ Failed to create folder ${folder}:`, error.message);
        }
    }

    console.log('\n🎉 S3 bucket structure setup complete!');
    console.log('\n📋 Folder structure:');
    folders.forEach(folder => {
        console.log(`   /${folder} - ${getFolderDescription(folder)}`);
    });
}

function getFolderDescription(folder) {
    const descriptions = {
        'student-ids/': 'Student ID verification documents',
        'resources/': 'Academic resources and files',
        'profile-pictures/': 'User profile pictures', 
        'temp/': 'Temporary files'
    };
    return descriptions[folder] || 'General files';
}

// Run the setup
setupS3Folders().catch(console.error);
