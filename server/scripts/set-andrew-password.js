require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Auth = require('../models/Auth');

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

const setPassword = async (email, newPassword) => {
  try {
    await connectDB();
    
    console.log(`Setting password for user with email: ${email}`);
    
    // Find the auth record
    const auth = await Auth.findOne({ email });
    
    if (!auth) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }
    
    console.log(`Found auth record: ${auth._id}`);
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    auth.password = hashedPassword;
    
    // Save the auth record
    await auth.save();
    
    console.log(`Password updated successfully for ${email}`);
    
    // Verify the new password works
    const passwordMatch = await bcrypt.compare(newPassword, auth.password);
    console.log(`Password verification: ${passwordMatch ? 'Success' : 'Failed'}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error setting password: ${error.message}`);
    process.exit(1);
  }
};

// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Please provide both email and new password as arguments');
  console.log('Usage: node set-andrew-password.js <email> <newPassword>');
  process.exit(1);
}

setPassword(email, newPassword);
