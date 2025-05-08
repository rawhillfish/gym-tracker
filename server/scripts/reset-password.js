/**
 * Script to reset a user's password
 * 
 * This script will:
 * 1. Find the auth record for a specific email
 * 2. Reset the password to a new value
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
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

// Reset password for a user
const resetPassword = async (email, newPassword) => {
  try {
    // Find auth record by email
    const auth = await Auth.findOne({ email });
    
    if (!auth) {
      console.error(`Auth record not found for email: ${email}`);
      process.exit(1);
    }
    
    console.log(`Found auth record for ${email} (ID: ${auth._id})`);
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password directly in the database to bypass any issues with the pre-save hook
    const result = await Auth.updateOne(
      { _id: auth._id },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`Password reset successfully for ${email}`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.error('Failed to update password');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Main function
const main = async () => {
  // Get email and new password from command line arguments
  const email = process.argv[2];
  const newPassword = process.argv[3] || 'password123';
  
  if (!email) {
    console.error('Please provide an email address as the first argument');
    process.exit(1);
  }
  
  await connectDB();
  await resetPassword(email, newPassword);
};

// Run the script
main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
