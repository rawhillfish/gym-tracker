require('dotenv').config();
const mongoose = require('mongoose');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkAdminStatus = async (email) => {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the auth record by email
    const auth = await Auth.findOne({ email });
    
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
    console.log(`Admin status: ${auth.isAdmin}`);
    
    // Print the full user and auth objects for debugging
    console.log('\nAuth record:');
    console.log(auth);
    
    console.log('\nUser record:');
    console.log(user);
  } catch (error) {
    console.error('Error checking admin status:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: node check-admin-status.js user@example.com');
  process.exit(1);
}

checkAdminStatus(email);
