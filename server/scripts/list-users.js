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

const listUsers = async () => {
  try {
    await connectDB();
    
    console.log('Fetching all users...');
    const users = await User.find().lean();
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Color: ${user.color}`);
      console.log(`Is Deleted: ${user.isDeleted || false}`);
      console.log(`Created At: ${user.createdAt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Error listing users: ${error.message}`);
    process.exit(1);
  }
};

listUsers();
