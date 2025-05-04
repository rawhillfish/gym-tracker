/**
 * Debug script to check the current state of the database
 * This will print out all exercises, templates, and completed workouts
 * with their IDs to help diagnose weight pre-filling issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Exercise = require('../models/Exercise');
const CompletedWorkout = require('../models/CompletedWorkout');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const User = require('../models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function debugDatabase() {
  try {
    console.log('\n=== DATABASE DEBUG INFO ===\n');
    
    // Check exercises
    console.log('=== EXERCISES ===');
    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises`);
    
    exercises.forEach((ex, index) => {
      console.log(`${index + 1}. ${ex.name}`);
      console.log(`   _id: ${ex._id}`);
      console.log(`   exerciseId: ${ex.exerciseId}`);
      console.log(`   category: ${ex.category}`);
      console.log('');
    });
    
    // Check workout templates
    console.log('\n=== WORKOUT TEMPLATES ===');
    const templates = await WorkoutTemplate.find({});
    console.log(`Found ${templates.length} templates`);
    
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`);
      console.log(`   _id: ${template._id}`);
      console.log(`   Exercises: ${template.exercises.length}`);
      
      template.exercises.forEach((ex, exIndex) => {
        console.log(`   ${exIndex + 1}. ${ex.name}`);
        console.log(`      exerciseId: ${ex.exerciseId}`);
        console.log(`      _id: ${ex._id}`);
      });
      
      console.log('');
    });
    
    // Check completed workouts
    console.log('\n=== COMPLETED WORKOUTS ===');
    const workouts = await CompletedWorkout.find({}).populate('user', 'name');
    console.log(`Found ${workouts.length} completed workouts`);
    
    workouts.forEach((workout, index) => {
      console.log(`${index + 1}. ${workout.templateName}`);
      console.log(`   _id: ${workout._id}`);
      console.log(`   templateId: ${workout.templateId}`);
      console.log(`   user: ${workout.user?.name || 'Unknown'}`);
      console.log(`   startTime: ${workout.startTime}`);
      console.log(`   endTime: ${workout.endTime}`);
      console.log(`   Exercises: ${workout.exercises.length}`);
      
      workout.exercises.forEach((ex, exIndex) => {
        console.log(`   ${exIndex + 1}. ${ex.name}`);
        console.log(`      exerciseId: ${ex.exerciseId}`);
        
        // Check if any sets have weights
        const hasWeights = ex.sets.some(set => set.weight !== null && set.weight !== '');
        console.log(`      Has weights: ${hasWeights}`);
        
        if (hasWeights) {
          console.log(`      Weights: ${ex.sets.map(set => set.weight).join(', ')}`);
        }
      });
      
      console.log('');
    });
    
    // Check for ID mismatches
    console.log('\n=== ID CONSISTENCY CHECK ===');
    
    // Check if all exercises have exerciseId matching _id
    const exercisesWithMismatchedIds = exercises.filter(ex => 
      ex.exerciseId && ex._id.toString() !== ex.exerciseId
    );
    
    if (exercisesWithMismatchedIds.length > 0) {
      console.log(`WARNING: Found ${exercisesWithMismatchedIds.length} exercises with mismatched IDs:`);
      exercisesWithMismatchedIds.forEach(ex => {
        console.log(`- ${ex.name}: _id=${ex._id}, exerciseId=${ex.exerciseId}`);
      });
    } else {
      console.log('All exercises have consistent IDs');
    }
    
    // Check if all completed workouts have templateId
    const workoutsWithoutTemplateId = workouts.filter(w => !w.templateId);
    
    if (workoutsWithoutTemplateId.length > 0) {
      console.log(`WARNING: Found ${workoutsWithoutTemplateId.length} workouts without templateId`);
    } else {
      console.log('All completed workouts have templateId');
    }
    
    // Check if all exercises in completed workouts have exerciseId
    let exercisesWithoutId = 0;
    workouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (!ex.exerciseId) {
          exercisesWithoutId++;
          console.log(`WARNING: Exercise ${ex.name} in workout ${workout.templateName} has no exerciseId`);
        }
      });
    });
    
    if (exercisesWithoutId === 0) {
      console.log('All exercises in completed workouts have exerciseId');
    } else {
      console.log(`WARNING: Found ${exercisesWithoutId} exercises in completed workouts without exerciseId`);
    }
    
    console.log('\n=== END DATABASE DEBUG INFO ===');
    
  } catch (error) {
    console.error('Error during database debugging:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the debug function
debugDatabase();
