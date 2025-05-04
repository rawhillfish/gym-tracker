/**
 * Migration script to add exerciseId field to all exercises
 * 
 * This script will:
 * 1. Find all exercises in the database
 * 2. Add an exerciseId field to each exercise that matches its _id
 * 3. Update the exercises in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Exercise = require('../models/Exercise');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function migrateExercises() {
  try {
    // Get all exercises
    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises`);

    let updatedCount = 0;

    // Process each exercise
    for (const exercise of exercises) {
      // Add exerciseId field if it doesn't exist
      if (!exercise.exerciseId) {
        exercise.exerciseId = exercise._id.toString();
        await exercise.save();
        updatedCount++;
        console.log(`Updated exercise ${exercise.name} with exerciseId ${exercise.exerciseId}`);
      }
    }

    console.log(`Migration complete: ${updatedCount} exercises updated with exerciseId`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateExercises();
