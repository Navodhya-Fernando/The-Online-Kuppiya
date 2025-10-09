const mongoose = require('mongoose');

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {});
        console.log('MongoDB connection established successfully!');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); 
    }
};
