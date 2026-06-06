const mongoose = require('mongoose');
const User = require('./models/User.model');
const loadEnv = require('./config/env');

loadEnv();

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/online-kuppiya')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // List current indexes
      const indexes = await User.collection.getIndexes();
      console.log('Current indexes:', Object.keys(indexes));
      
      // Drop problematic old indexes
      const oldIndexes = ['username_1', 'whatsappNumber_1', 'studentId_1'];
      
      for (const indexName of oldIndexes) {
        if (indexes[indexName]) {
          console.log(`Dropping old ${indexName} index...`);
          await User.collection.dropIndex(indexName);
          console.log(`✅ Successfully dropped ${indexName} index`);
        }
      }
      
      // Check for any documents with username field and remove it
      const usersWithUsername = await User.find({ username: { $exists: true } });
      if (usersWithUsername.length > 0) {
        console.log(`Found ${usersWithUsername.length} users with username field. Removing...`);
        await User.updateMany({}, { $unset: { username: 1 } });
        console.log('✅ Removed username fields from existing users');
      }
      
      // Verify current schema matches
      console.log('Ensuring current schema indexes...');
      await User.ensureIndexes();
      console.log('✅ Schema indexes updated');
      
      console.log('🎉 Database cleanup completed successfully!');
      
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    } finally {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });
