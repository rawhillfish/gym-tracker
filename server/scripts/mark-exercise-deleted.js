/**
 * Script to manually mark an exercise as deleted in the database
 * 
 * Usage: node scripts/mark-exercise-deleted.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
console.log(`Loading environment from ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

// Import models
const Exercise = require('../models/Exercise');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_PROD_URI || process.env.MONGODB_URI
      : process.env.MONGODB_URI;
    
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using MongoDB URI:', mongoURI.substring(0, 20) + '...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Mark an exercise as deleted
const markExerciseAsDeleted = async () => {
  try {
    // Find the first exercise
    const exercise = await Exercise.findOne();
    
    if (!exercise) {
      console.error('No exercises found in the database');
      process.exit(1);
    }
    
    console.log('Found exercise:', exercise.name);
    
    // Mark as deleted
    exercise.isDeleted = true;
    exercise.deletedAt = new Date();
    await exercise.save();
    
    console.log(`Exercise "${exercise.name}" marked as deleted successfully`);
    
    // Verify the change
    const updatedExercise = await Exercise.findById(exercise._id);
    console.log('Updated exercise:', {
      name: updatedExercise.name,
      isDeleted: updatedExercise.isDeleted,
      deletedAt: updatedExercise.deletedAt
    });
    
    // Count deleted exercises
    const deletedCount = await Exercise.countDocuments({ isDeleted: true });
    console.log(`Total deleted exercises: ${deletedCount}`);
  } catch (error) {
    console.error('Error marking exercise as deleted:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await markExerciseAsDeleted();
    console.log('Operation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the script
main();
