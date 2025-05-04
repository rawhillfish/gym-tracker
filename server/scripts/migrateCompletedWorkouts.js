/**
 * Migration script to add templateId field to existing completed workouts
 * and exerciseId field to exercises
 * 
 * This script will:
 * 1. Find all completed workouts without a templateId
 * 2. Try to match them with workout templates by name
 * 3. Update the completed workouts with the matching templateId
 * 4. For workouts without a matching template, assign a default templateId
 * 5. For each exercise in the workout, try to match with known exercises and add exerciseId
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const CompletedWorkout = require('../models/CompletedWorkout');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const Exercise = require('../models/Exercise');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function migrateCompletedWorkouts() {
  try {
    // Get all workout templates for matching
    const templates = await WorkoutTemplate.find({});
    console.log(`Found ${templates.length} workout templates`);

    // Get all exercises for matching
    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises`);

    // Find completed workouts without templateId
    const workoutsToUpdate = await CompletedWorkout.find({ 
      $or: [
        { templateId: { $exists: false } },
        { "exercises.exerciseId": { $exists: false } }
      ]
    });
    console.log(`Found ${workoutsToUpdate.length} completed workouts to update`);

    let updatedWorkoutCount = 0;
    let updatedExerciseCount = 0;
    let noTemplateMatchCount = 0;
    let noExerciseMatchCount = 0;

    // Process each workout
    for (const workout of workoutsToUpdate) {
      let workoutUpdated = false;
      
      // Update templateId if missing
      if (!workout.templateId) {
        // Try to find a matching template by name
        const matchingTemplate = templates.find(template => 
          template.name && workout.templateName && 
          template.name.toLowerCase() === workout.templateName.toLowerCase()
        );

        if (matchingTemplate) {
          // Update with matching templateId
          workout.templateId = matchingTemplate._id.toString();
          workoutUpdated = true;
          updatedWorkoutCount++;
          console.log(`Updated workout ${workout._id} with templateId ${matchingTemplate._id}`);
        } else {
          // No matching template found, use a default ID
          workout.templateId = 'legacy-template';
          workoutUpdated = true;
          noTemplateMatchCount++;
          console.log(`No matching template found for workout ${workout._id} with name "${workout.templateName}"`);
        }
      }
      
      // Update exerciseId for each exercise if missing
      if (workout.exercises && Array.isArray(workout.exercises)) {
        for (const exercise of workout.exercises) {
          if (!exercise.exerciseId) {
            // Try to find a matching exercise by name
            const matchingExercise = exercises.find(ex => 
              ex.name && exercise.name && 
              ex.name.toLowerCase() === exercise.name.toLowerCase()
            );
            
            if (matchingExercise) {
              // Update with matching exerciseId
              exercise.exerciseId = matchingExercise._id.toString();
              workoutUpdated = true;
              updatedExerciseCount++;
              console.log(`Updated exercise ${exercise.name} with exerciseId ${matchingExercise._id}`);
            } else {
              // No matching exercise found, use a default ID
              exercise.exerciseId = 'legacy-exercise-' + exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
              workoutUpdated = true;
              noExerciseMatchCount++;
              console.log(`No matching exercise found for "${exercise.name}"`);
            }
          }
        }
      }
      
      // Save the workout if any updates were made
      if (workoutUpdated) {
        await workout.save();
      }
    }

    console.log(`Migration complete:`);
    console.log(`- ${updatedWorkoutCount} workouts updated with matching templateId`);
    console.log(`- ${noTemplateMatchCount} workouts updated with default templateId`);
    console.log(`- ${updatedExerciseCount} exercises updated with matching exerciseId`);
    console.log(`- ${noExerciseMatchCount} exercises updated with default exerciseId`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateCompletedWorkouts();
