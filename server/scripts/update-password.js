require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Auth = require('../models/Auth');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const updatePassword = async (email, newPassword) => {
  try {
    console.log(`Updating password for email: ${email}`);
    
    // Find the auth record by email
    const auth = await Auth.findOne({ email });
    
    if (!auth) {
      console.error(`No user found with email: ${email}`);
      return;
    }
    
    console.log('Auth record found:', {
      id: auth._id,
      email: auth.email,
      userId: auth.userId,
      isAdmin: auth.isAdmin
    });
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    auth.password = hashedPassword;
    await auth.save();
    
    console.log('Password updated successfully!');
    
    // Generate token
    const token = auth.getSignedJwtToken();
    
    console.log('\nNew token:');
    console.log(token);
    
    // Decode and display the token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\nDecoded token:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\nUse this token for testing by setting it in localStorage:');
    console.log('localStorage.setItem("token", "' + token + '")');
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Please provide both email and new password as arguments');
  console.log('Usage: node update-password.js <email> <new-password>');
  process.exit(1);
}

updatePassword(email, newPassword);
