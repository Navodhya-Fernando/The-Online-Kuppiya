const mongoose = require('mongoose');
const User = require('./models/User.model');
const loadEnv = require('./config/env');

loadEnv();

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/online-kuppiya')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // List all users to help identify which one to promote
      console.log('\n📋 Current Users in Database:');
      const users = await User.find({}).select('_id name email role isApproved university');
      
      if (users.length === 0) {
        console.log('No users found in database');
        return;
      }
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role} | Approved: ${user.isApproved} | University: ${user.university}`);
        console.log(`   ID: ${user._id}`);
        console.log('');
      });
      
      console.log('🔧 To set a user as admin, run:');
      console.log('   node set-admin.js <email>');
      console.log('');
      console.log('Example:');
      console.log('   node set-admin.js john@example.com');
      
    } catch (error) {
      console.error('❌ Error listing users:', error);
    } finally {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });
