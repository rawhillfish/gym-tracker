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

const addTestUser = async () => {
  try {
    await connectDB();
    
    console.log('Adding test user...');
    
    // Create a new test user
    const newUser = new User({
      name: 'Test User',
      color: '#2196f3', // Blue
      retired: false,
      isDeleted: false
    });
    
    const savedUser = await newUser.save();
    
    console.log('Test user added successfully:');
    console.log(`ID: ${savedUser._id}`);
    console.log(`Name: ${savedUser.name}`);
    console.log(`Color: ${savedUser.color}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error adding test user: ${error.message}`);
    process.exit(1);
  }
};

addTestUser();
