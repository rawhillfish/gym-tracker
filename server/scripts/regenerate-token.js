require('dotenv').config();
const mongoose = require('mongoose');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const regenerateToken = async (email) => {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the auth record by email
    const auth = await Auth.findOne({ email }).select('+password');
    
    if (!auth) {
      console.error(`No user found with email: ${email}`);
      return;
    }
    
    // Find the associated user
    const user = await User.findById(auth.userId);
    
    if (!user) {
      console.error(`No user record found for auth ID: ${auth._id}`);
      return;
    }
    
    console.log(`Found user: ${user.name} (${user._id})`);
    console.log(`Current admin status: ${auth.isAdmin}`);
    
    // Generate a new token that includes the isAdmin field
    const token = auth.getSignedJwtToken();
    
    console.log(`\nNew token for ${user.name} (${email}):`);
    console.log(token);
    
    // Decode and display the token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\nDecoded token:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\nUse this token for testing by setting it in localStorage:');
    console.log('localStorage.setItem("token", "' + token + '")');
    
  } catch (error) {
    console.error('Error regenerating token:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: node regenerate-token.js user@example.com');
  process.exit(1);
}

regenerateToken(email);
