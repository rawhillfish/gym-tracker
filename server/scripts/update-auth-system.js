/**
 * Script to update the authentication system for production
 * 
 * This script will:
 * 1. Find all users in the database
 * 2. Create auth records for users that don't have one
 * 3. Update specific users (Jason and Andrew) with known credentials
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

// Update auth system
const updateAuthSystem = async () => {
  try {
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // Default password (will be hashed)
    const defaultPassword = 'password';
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    // Special users with specific credentials
    const specialUsers = {
      'Jason': {
        email: 'jason@example.com',
        password: 'password',
        isAdmin: true
      },
      'Andrew': {
        email: 'andrew@example.com',
        password: 'password',
        isAdmin: false
      }
    };
    
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const user of users) {
      // Check if this is a special user
      const isSpecialUser = specialUsers[user.name];
      
      // Check if auth record already exists for this user
      let existingAuth = await Auth.findOne({ userId: user._id });
      
      if (existingAuth) {
        // If special user, update their credentials
        if (isSpecialUser) {
          // Hash the special password
          const specialHashedPassword = await bcrypt.hash(isSpecialUser.password, salt);
          
          // Update the auth record
          await Auth.updateOne(
            { _id: existingAuth._id },
            { 
              $set: { 
                email: isSpecialUser.email,
                password: specialHashedPassword,
                isAdmin: isSpecialUser.isAdmin
              } 
            }
          );
          
          console.log(`Updated auth record for ${user.name} with email: ${isSpecialUser.email}`);
          updatedCount++;
        } else {
          console.log(`Auth record already exists for ${user.name} (${existingAuth.email})`);
          skippedCount++;
        }
        continue;
      }
      
      // Create email and password based on user type
      let email, password, isAdmin;
      
      if (isSpecialUser) {
        email = isSpecialUser.email;
        password = await bcrypt.hash(isSpecialUser.password, salt);
        isAdmin = isSpecialUser.isAdmin;
      } else {
        // Create email from username (lowercase, no spaces)
        email = `${user.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
        password = hashedPassword;
        isAdmin = false;
      }
      
      // Create new auth record
      const newAuth = new Auth({
        email,
        password, // Pre-hashed password
        userId: user._id,
        isAdmin
      });
      
      // Save directly to bypass pre-save hook (password is already hashed)
      await newAuth.save();
      
      console.log(`Created auth record for ${user.name} with email: ${email}`);
      createdCount++;
    }
    
    console.log(`\nSummary:`);
    console.log(`- Created ${createdCount} new auth records`);
    console.log(`- Updated ${updatedCount} existing auth records`);
    console.log(`- Skipped ${skippedCount} existing auth records`);
    console.log(`\nSpecial users:`);
    for (const [name, data] of Object.entries(specialUsers)) {
      console.log(`- ${name}: ${data.email} / ${data.password}`);
    }
    console.log(`\nDefault password for all other accounts: ${defaultPassword}`);
    
  } catch (error) {
    console.error('Error updating auth system:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Main function
const main = async () => {
  await connectDB();
  await updateAuthSystem();
};

// Run the script
main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
