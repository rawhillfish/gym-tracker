const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkMongoDBConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('MongoDB connection successful!');
    console.log(`Connected to: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

checkMongoDBConnection();
