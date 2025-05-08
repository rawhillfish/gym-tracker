require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testLogin = async (email, password) => {
  try {
    console.log(`Testing login for email: ${email}`);
    
    // Find the auth record by email
    const auth = await Auth.findOne({ email }).select('+password');
    
    if (!auth) {
      console.error(`No user found with email: ${email}`);
      return;
    }
    
    console.log('Auth record found:', {
      id: auth._id,
      email: auth.email,
      userId: auth.userId,
      isAdmin: auth.isAdmin,
      passwordLength: auth.password ? auth.password.length : 0
    });
    
    // Find the associated user
    const user = await User.findById(auth.userId);
    
    if (!user) {
      console.error(`No user record found for auth ID: ${auth._id}`);
      return;
    }
    
    console.log(`Found user: ${user.name} (${user._id})`);
    
    // Test password match
    console.log(`Testing password match for: ${password}`);
    const isMatch = await auth.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      // Generate token
      const token = auth.getSignedJwtToken();
      
      console.log('\nLogin successful!');
      console.log('Token:', token);
      
      // Decode and display the token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      console.log('\nDecoded token:');
      console.log(JSON.stringify(decoded, null, 2));
      
      console.log('\nUse this token for testing by setting it in localStorage:');
      console.log('localStorage.setItem("token", "' + token + '")');
      
      // Create a mock response like the login endpoint
      const mockResponse = {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          color: user.color,
          isAdmin: auth.isAdmin
        }
      };
      
      console.log('\nMock login response:');
      console.log(JSON.stringify(mockResponse, null, 2));
    } else {
      console.log('Login failed: Password does not match');
    }
    
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide both email and password as arguments');
  console.log('Usage: node test-login.js <email> <password>');
  process.exit(1);
}

testLogin(email, password);
