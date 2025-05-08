/**
 * Script to create authentication credentials for existing users
 * 
 * This script will:
 * 1. Find existing users (Jason and Andrew)
 * 2. Create authentication records for them with email and password
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Auth = require('../models/Auth');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI is not defined in .env file');
      process.exit(1);
    }
    
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using MongoDB URI:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create authentication records for existing users
const createAuthForExistingUsers = async () => {
  try {
    // Find existing users
    const jasonUser = await User.findOne({ name: 'Jason' });
    const andrewUser = await User.findOne({ name: 'Andrew' });
    
    if (!jasonUser || !andrewUser) {
      console.error('Could not find one or both users. Make sure Jason and Andrew exist in the database.');
      process.exit(1);
    }
    
    console.log('Found users:');
    console.log(`- Jason (ID: ${jasonUser._id})`);
    console.log(`- Andrew (ID: ${andrewUser._id})`);
    
    // Check if auth records already exist
    const existingJasonAuth = await Auth.findOne({ userId: jasonUser._id });
    const existingAndrewAuth = await Auth.findOne({ userId: andrewUser._id });
    
    if (existingJasonAuth) {
      console.log('Auth record for Jason already exists, skipping creation.');
    } else {
      // Create auth record for Jason
      const jasonAuth = await Auth.create({
        email: 'jason@example.com',
        password: 'password123',  // This will be hashed by the pre-save hook
        userId: jasonUser._id
      });
      console.log('Created auth record for Jason:', jasonAuth._id);
    }
    
    if (existingAndrewAuth) {
      console.log('Auth record for Andrew already exists, skipping creation.');
    } else {
      // Create auth record for Andrew
      const andrewAuth = await Auth.create({
        email: 'andrew@example.com',
        password: 'password123',  // This will be hashed by the pre-save hook
        userId: andrewUser._id
      });
      console.log('Created auth record for Andrew:', andrewAuth._id);
    }
    
    console.log('\nLogin credentials:');
    console.log('Jason:');
    console.log('  Email: jason@example.com');
    console.log('  Password: password123');
    console.log('Andrew:');
    console.log('  Email: andrew@example.com');
    console.log('  Password: password123');
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Error creating auth records:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Run the script
connectDB()
  .then(() => createAuthForExistingUsers())
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });
