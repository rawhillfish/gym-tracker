require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const CompletedWorkout = require('../models/CompletedWorkout');
const User = require('../models/User');

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

const debugWorkoutAuth = async (workoutId, token) => {
  try {
    await connectDB();
    
    console.log(`Debugging workout authorization for workout: ${workoutId}`);
    
    // Decode the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development'
    );
    
    console.log('Decoded token:', decoded);
    console.log('User ID from token:', decoded.id);
    
    // Get the user from the token
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('User not found with token ID');
      process.exit(1);
    }
    
    console.log('User details:');
    console.log(`Name: ${user.name}`);
    console.log(`ID: ${user._id}`);
    console.log(`Is Admin: ${user.isAdmin}`);
    
    // Get the workout
    const workout = await CompletedWorkout.findById(workoutId).populate('user', 'name _id');
    
    if (!workout) {
      console.error(`Workout not found with ID: ${workoutId}`);
      process.exit(1);
    }
    
    console.log('Workout details:');
    console.log(`Template Name: ${workout.templateName}`);
    console.log(`User ID from workout: ${workout.user?._id}`);
    
    // Compare the two IDs
    const workoutUserId = workout.user?._id?.toString();
    const tokenUserId = user._id.toString();
    
    console.log(`Workout user ID: ${workoutUserId}`);
    console.log(`Token user ID: ${tokenUserId}`);
    console.log(`Are the IDs equal? ${workoutUserId === tokenUserId}`);
    
    // Check authorization logic
    const isAuthorized = user.isAdmin || workoutUserId === tokenUserId;
    console.log(`Is user authorized to edit this workout? ${isAuthorized}`);
    
    // Detailed comparison for debugging
    if (workout.user && workout.user._id) {
      console.log('Detailed ID comparison:');
      console.log(`Workout user ID (toString): ${workout.user._id.toString()}`);
      console.log(`Token user ID (toString): ${user._id.toString()}`);
      console.log(`Using == comparison: ${workout.user._id == user._id}`);
      console.log(`Using === comparison: ${workout.user._id === user._id}`);
      console.log(`Using ObjectId equals: ${workout.user._id.equals(user._id)}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error debugging workout authorization: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Get workout ID and token from command line arguments
const workoutId = process.argv[2];
const token = process.argv[3];

if (!workoutId || !token) {
  console.error('Please provide both workout ID and token as arguments');
  console.log('Usage: node debug-workout-auth.js <workoutId> <token>');
  process.exit(1);
}

debugWorkoutAuth(workoutId, token);
