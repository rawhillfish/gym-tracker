/**
 * Script to create auth records for existing users
 * 
 * This script will:
 * 1. Find all users in the database
 * 2. Create auth records for users that don't have one
 * 3. Set default passwords that can be reset later
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Auth = require('../models/Auth');
const User = require('../models/User');

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

// Create auth records for users
const createAuthRecords = async () => {
  try {
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // Default password (will be hashed)
    const defaultPassword = 'password123';
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const user of users) {
      // Check if auth record already exists for this user
      const existingAuth = await Auth.findOne({ userId: user._id });
      
      if (existingAuth) {
        console.log(`Auth record already exists for ${user.name} (${existingAuth.email})`);
        skippedCount++;
        continue;
      }
      
      // Create email from username (lowercase, no spaces)
      const email = `${user.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
      
      // Create new auth record
      const newAuth = new Auth({
        email,
        password: hashedPassword, // Pre-hashed password
        userId: user._id,
        isAdmin: user.name === 'Jason' // Make Jason an admin
      });
      
      // Save directly to bypass pre-save hook (password is already hashed)
      await newAuth.save();
      
      console.log(`Created auth record for ${user.name} with email: ${email}`);
      createdCount++;
    }
    
    console.log(`\nSummary:`);
    console.log(`- Created ${createdCount} new auth records`);
    console.log(`- Skipped ${skippedCount} existing auth records`);
    console.log(`- Default password for all new accounts: ${defaultPassword}`);
    console.log(`\nUse the reset-password.js script to change passwords for specific users.`);
    
  } catch (error) {
    console.error('Error creating auth records:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAuthRecords();
};

// Run the script
main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
