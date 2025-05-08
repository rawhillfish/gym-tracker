require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

const updatePassword = async (email, newPassword) => {
  try {
    await connectDB();
    
    console.log(`Directly updating password for user with email: ${email}`);
    
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('Generated hashed password:', hashedPassword);
    
    // Update the password directly in the database
    const result = await mongoose.connection.collection('auths').updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }
    
    console.log(`Password updated successfully for ${email}`);
    console.log(`Modified: ${result.modifiedCount}`);
    
    // Verify the password was updated
    const auth = await mongoose.connection.collection('auths').findOne({ email });
    
    if (!auth) {
      console.error(`Could not find auth record after update for email: ${email}`);
      process.exit(1);
    }
    
    console.log('Updated auth record password length:', auth.password.length);
    
    // Test the password
    const passwordMatch = await bcrypt.compare(newPassword, auth.password);
    console.log(`Password verification: ${passwordMatch ? 'Success' : 'Failed'}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error updating password: ${error.message}`);
    process.exit(1);
  }
};

// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Please provide both email and new password as arguments');
  console.log('Usage: node direct-password-update.js <email> <newPassword>');
  process.exit(1);
}

updatePassword(email, newPassword);
