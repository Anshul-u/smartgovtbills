const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check for MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartgov-bills';
    
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log('⚠ Could not connect to MongoDB at:', mongoUri);
      console.log('  Starting In-Memory Demo Database (data will not persist)...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✓ MongoDB Connected (In-Memory): ${conn.connection.host}`);
      console.log('  ⚠ Data will be lost when server restarts!');
      console.log('  → Set MONGODB_URI in .env to persist data');
    }
  } catch (error) {
    console.error(`✗ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
