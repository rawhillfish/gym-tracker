require('dotenv').config();
const mongoose = require('mongoose');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const makeAdmin = async (email) => {
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
    console.log(`Current admin status: ${auth.isAdmin}`);
    
    // Update admin status
    auth.isAdmin = true;
    await auth.save();
    
    console.log(`User ${user.name} (${email}) is now an admin!`);
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: node make-admin.js user@example.com');
  process.exit(1);
}

makeAdmin(email);
