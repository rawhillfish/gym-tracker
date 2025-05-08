/**
 * Script to fix auth passwords in the production database
 * 
 * This script will:
 * 1. Find auth records for Jason and Andrew
 * 2. Set their passwords directly with proper bcrypt hashing
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

// Fix auth passwords
const fixAuthPasswords = async () => {
  try {
    // Special users with specific credentials
    const specialUsers = [
      {
        email: 'jason@example.com',
        password: 'password'
      },
      {
        email: 'andrew@example.com',
        password: 'password'
      }
    ];
    
    // Process each special user
    for (const user of specialUsers) {
      console.log(`Processing user: ${user.email}`);
      
      // Find auth record by email
      const auth = await Auth.findOne({ email: user.email });
      
      if (!auth) {
        console.error(`Auth record not found for email: ${user.email}`);
        continue;
      }
      
      console.log(`Found auth record for ${user.email} (ID: ${auth._id})`);
      
      // Hash the password directly using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Update the auth record with the new password
      // Use updateOne to bypass the pre-save hook
      const result = await Auth.updateOne(
        { _id: auth._id },
        { $set: { password: hashedPassword } }
      );
      
      if (result.modifiedCount === 1) {
        console.log(`Password reset successfully for ${user.email}`);
        
        // Verify the password works
        const updatedAuth = await Auth.findOne({ email: user.email }).select('+password');
        const isMatch = await bcrypt.compare(user.password, updatedAuth.password);
        console.log(`Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      } else {
        console.error(`Failed to update password for ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Error fixing auth passwords:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Main function
const main = async () => {
  await connectDB();
  await fixAuthPasswords();
};

// Run the script
main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
