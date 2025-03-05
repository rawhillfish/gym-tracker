require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const users = [
  { name: 'Jason', color: '#1976d2' },  // Blue
  { name: 'Andrew', color: '#388e3c' }   // Green
];

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create new users
    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createUsers();
