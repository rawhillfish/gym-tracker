/**
 * Script to fix all IDs in the database
 * 
 * This script will:
 * 1. Fix all exercise IDs
 * 2. Fix all workout and exercise IDs in completed workouts
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Exercise = require('../models/Exercise');
const Workout = require('../models/CompletedWorkout');
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function fixAllIds() {
  try {
    console.log('=== STARTING ID FIX OPERATION ===');
    
    // Step 1: Fix exercise IDs
    console.log('\n=== FIXING EXERCISE IDs ===');
    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises to check`);
    
    let updatedExerciseCount = 0;
    
    // Update exercises without exerciseId
    for (const exercise of exercises) {
      if (!exercise.exerciseId) {
        exercise.exerciseId = exercise._id.toString();
        await exercise.save();
        updatedExerciseCount++;
        console.log(`Updated exercise ${exercise.name} with exerciseId ${exercise.exerciseId}`);
      }
    }
    
    console.log(`Fixed ${updatedExerciseCount} exercises`);
    
    // Step 2: Fix workout and exercise IDs in completed workouts
    console.log('\n=== FIXING WORKOUT AND EXERCISE IDs ===');
    const workouts = await Workout.find({});
    console.log(`Found ${workouts.length} workouts to check`);
    
    // Get all workout templates for matching
    const templates = await WorkoutTemplate.find({});
    console.log(`Found ${templates.length} workout templates for matching`);
    
    // Create a map of exercise names to IDs
    const exerciseMap = {};
    exercises.forEach(ex => {
      exerciseMap[ex.name.toLowerCase()] = ex._id.toString();
    });
    
    let updatedWorkoutCount = 0;
    let updatedWorkoutExerciseCount = 0;
    
    // Process each workout
    for (const workout of workouts) {
      let workoutUpdated = false;
      
      // Add templateId if missing
      if (!workout.templateId && workout.templateName) {
        const matchingTemplate = templates.find(t => 
          t.name && workout.templateName && 
          t.name.toLowerCase() === workout.templateName.toLowerCase()
        );
        
        if (matchingTemplate) {
          workout.templateId = matchingTemplate._id.toString();
          console.log(`Updated workout ${workout._id} with templateId ${matchingTemplate._id}`);
          workoutUpdated = true;
        } else {
          workout.templateId = 'legacy-template';
          console.log(`Set default templateId for workout ${workout._id}`);
          workoutUpdated = true;
        }
      }
      
      // Update exercises
      if (workout.exercises && Array.isArray(workout.exercises)) {
        for (const exercise of workout.exercises) {
          if (!exercise.exerciseId && exercise.name) {
            const matchingId = exerciseMap[exercise.name.toLowerCase()];
            if (matchingId) {
              exercise.exerciseId = matchingId;
              console.log(`Updated exercise ${exercise.name} with exerciseId ${matchingId}`);
              updatedWorkoutExerciseCount++;
              workoutUpdated = true;
            } else {
              // Create a fallback ID based on the name
              exercise.exerciseId = `legacy-exercise-${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              console.log(`Set default exerciseId for ${exercise.name}`);
              updatedWorkoutExerciseCount++;
              workoutUpdated = true;
            }
          }
        }
      }
      
      // Save if updated
      if (workoutUpdated) {
        await workout.save();
        updatedWorkoutCount++;
      }
    }
    
    console.log(`Fixed ${updatedWorkoutCount} workouts and ${updatedWorkoutExerciseCount} exercises in workouts`);
    
    console.log('\n=== ID FIX OPERATION COMPLETE ===');
    console.log(`Total fixes:`);
    console.log(`- ${updatedExerciseCount} exercises updated with exerciseId`);
    console.log(`- ${updatedWorkoutCount} workouts updated with templateId`);
    console.log(`- ${updatedWorkoutExerciseCount} exercises in workouts updated with exerciseId`);
    
  } catch (error) {
    console.error('Error during ID fix operation:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the fix operation
fixAllIds();
