const mongoose = require('mongoose');
const User = require('./models/User.model');

// Get email from command line argument
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node set-admin.js <email>');
  console.log('Example: node set-admin.js john@example.com');
  process.exit(1);
}

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/online-kuppiya')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find user by email
      const user = await User.findOne({ email: targetEmail });
      
      if (!user) {
        console.error(`❌ User with email '${targetEmail}' not found`);
        
        // Show available users
        const users = await User.find({}).select('name email');
        console.log('\n📋 Available users:');
        users.forEach(u => console.log(`   - ${u.name} (${u.email})`));
        return;
      }
      
      console.log(`\n👤 Found user: ${user.name} (${user.email})`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Current approval status: ${user.isApproved}`);
      
      // Update user to admin and ensure they're approved
      const updateResult = await User.findByIdAndUpdate(
        user._id,
        { 
          role: 'admin',
          isApproved: true 
        },
        { new: true }
      );
      
      if (updateResult) {
        console.log('\n🎉 Successfully updated user!');
        console.log(`   ✅ Role: student → admin`);
        console.log(`   ✅ Approved: ${user.isApproved} → true`);
        console.log(`\n👑 ${user.name} is now an admin!`);
        console.log('\n🚀 You can now:');
        console.log('   - Access admin panel at /admin');
        console.log('   - Approve/reject user registrations');
        console.log('   - Manage platform resources');
      } else {
        console.error('❌ Failed to update user');
      }
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
    } finally {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });
