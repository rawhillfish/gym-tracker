require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gym-tracker');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const unretireUser = async (userId) => {
  try {
    await connectDB();
    
    console.log(`Unretiring user with ID: ${userId}`);
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name}`);
    console.log(`Current retired status: ${user.retired}`);
    
    // Update the user
    user.retired = false;
    await user.save();
    
    console.log(`User ${user.name} has been unretired`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error unretiring user: ${error.message}`);
    process.exit(1);
  }
};

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument');
  console.log('Usage: node unretire-user.js <userId>');
  process.exit(1);
}

unretireUser(userId);
