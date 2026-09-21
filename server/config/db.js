const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';

    // Check if mongodb-memory-server is installed for automatic fallback
    let memoryServerAvailable = false;
    try {
      require.resolve('mongodb-memory-server');
      memoryServerAvailable = true;
    } catch (e) {
      memoryServerAvailable = false;
    }

    if ((!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '') && memoryServerAvailable) {
      console.log('⚡ Starting in-memory MongoDB server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`✅ In-memory MongoDB started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`
ℹ️  To connect to MongoDB:
    1. Provide your MongoDB Atlas URI in server/.env: MONGODB_URI=mongodb+srv://...
    2. Or start your local MongoDB service: net start MongoDB
    3. Or install mongodb-memory-server: npm i mongodb-memory-server --prefix server
    `);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
