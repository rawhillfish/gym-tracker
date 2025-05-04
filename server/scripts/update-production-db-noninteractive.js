/**
 * Non-interactive script to update the production MongoDB database
 * 
 * Usage: NODE_ENV=production node scripts/update-production-db-noninteractive.js
 * 
 * This script will:
 * 1. Connect to the production MongoDB database
 * 2. Update the schema if needed
 * 3. Add new seed data while preserving existing user data and workout history
 * 
 * Note: This script does not require user confirmation and will run automatically.
 * Use with caution in production environments.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.production
console.log('Loading environment from .env.production');
dotenv.config({ path: path.resolve(__dirname, '..', '.env.production') });

// Import models
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const CompletedWorkout = require('../models/CompletedWorkout');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using MongoDB URI:', mongoURI.substring(0, 20) + '...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Backup existing data
const backupExistingData = async () => {
  console.log('Backing up existing data...');
  
  const users = await User.find({});
  console.log(`Found ${users.length} users`);
  
  const completedWorkouts = await CompletedWorkout.find({});
  console.log(`Found ${completedWorkouts.length} completed workouts`);
  
  return { users, completedWorkouts };
};

// Update exercises with latest categories and names
const updateExercises = async () => {
  console.log('Updating exercises...');
  
  // Get existing exercises to preserve any custom ones
  const existingExercises = await Exercise.find({});
  console.log(`Found ${existingExercises.length} existing exercises`);
  
  // Define the latest exercise data
  const latestExercises = [
    { name: 'Bench Press', defaultReps: 10, category: 'Chest' },
    { name: 'Bulgarian Split Squat', defaultReps: 10, category: 'Legs (Glutes)' },
    { name: 'Barbell Squat', defaultReps: 10, category: 'Legs (Quads)' },
    { name: 'Belt Squat', defaultReps: 10, category: 'Legs (Quads)' },
    { name: 'Deadlift', defaultReps: 10, category: 'Back' },
    { name: 'Romanian Deadlift', defaultReps: 10, category: 'Legs (Hamstring)' },
    { name: 'Military Shoulder Press', defaultReps: 10, category: 'Shoulders' },
    { name: 'Seal Barbell Row', defaultReps: 10, category: 'Back' },
    { name: 'Pull Ups', defaultReps: 10, category: 'Back' },
    { name: 'Bicep Curls', defaultReps: 10, category: 'Arms' },
    { name: 'Hammer Curls', defaultReps: 10, category: 'Arms' },
    { name: 'Tricep Extensions', defaultReps: 10, category: 'Arms' },
    { name: 'Calf Raises', defaultReps: 10, category: 'Legs (Calves)' },
    { name: 'Dumbbell Reverse Flies', defaultReps: 10, category: 'Shoulders' },
    { name: 'Face Pulls', defaultReps: 10, category: 'Shoulders' }
  ];
  
  // Map of old exercise names to new ones
  const exerciseNameMap = {
    'Shoulder Press': 'Military Shoulder Press',
    'Squat': 'Barbell Squat',
    'Barbell Row': 'Seal Barbell Row'
  };
  
  // Update existing exercises or create new ones
  for (const latestExercise of latestExercises) {
    // Check if exercise exists by name or mapped name
    const existingExercise = existingExercises.find(
      e => e.name === latestExercise.name || 
           (exerciseNameMap[e.name] && exerciseNameMap[e.name] === latestExercise.name)
    );
    
    if (existingExercise) {
      // Update existing exercise
      console.log(`Updating exercise: ${existingExercise.name} -> ${latestExercise.name}`);
      await Exercise.findByIdAndUpdate(existingExercise._id, {
        name: latestExercise.name,
        category: latestExercise.category,
        defaultReps: latestExercise.defaultReps
      });
    } else {
      // Create new exercise
      console.log(`Creating new exercise: ${latestExercise.name}`);
      await Exercise.create(latestExercise);
    }
  }
  
  console.log('Exercises updated successfully');
};

// Update workout templates with latest exercise references
const updateWorkoutTemplates = async () => {
  console.log('Updating workout templates...');
  
  // Get all exercises to reference in templates
  const allExercises = await Exercise.find({});
  const exerciseMap = {};
  allExercises.forEach(exercise => {
    exerciseMap[exercise.name] = exercise._id;
  });
  
  // Define the latest template data
  const latestTemplates = [
    {
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 10 },
        { name: 'Military Shoulder Press', sets: 3, reps: 10 },
        { name: 'Dumbbell Reverse Flies', sets: 3, reps: 10 },
        { name: 'Tricep Extensions', sets: 3, reps: 10 }
      ]
    },
    {
      name: 'Pull Day',
      exercises: [
        { name: 'Deadlift', sets: 3, reps: 10 },
        { name: 'Seal Barbell Row', sets: 3, reps: 10 },
        { name: 'Pull Ups', sets: 3, reps: 10 },
        { name: 'Bicep Curls', sets: 3, reps: 10 },
        { name: 'Hammer Curls', sets: 3, reps: 10 }
      ]
    },
    {
      name: 'Leg Day',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: 10 },
        { name: 'Belt Squat', sets: 3, reps: 10 },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 10 },
        { name: 'Romanian Deadlift', sets: 3, reps: 10 },
        { name: 'Calf Raises', sets: 3, reps: 10 }
      ]
    }
  ];
  
  // Get existing templates
  const existingTemplates = await WorkoutTemplate.find({});
  console.log(`Found ${existingTemplates.length} existing templates`);
  
  // Update existing templates or create new ones
  for (const latestTemplate of latestTemplates) {
    // Check if template exists by name
    const existingTemplate = existingTemplates.find(t => t.name === latestTemplate.name);
    
    // Prepare exercises with IDs
    const exercisesWithIds = latestTemplate.exercises.map(exercise => {
      return {
        name: exercise.name,
        exerciseId: exerciseMap[exercise.name],
        sets: exercise.sets,
        reps: exercise.reps
      };
    });
    
    if (existingTemplate) {
      // Update existing template
      console.log(`Updating template: ${existingTemplate.name}`);
      await WorkoutTemplate.findByIdAndUpdate(existingTemplate._id, {
        name: latestTemplate.name,
        exercises: exercisesWithIds,
        isDeleted: false
      });
    } else {
      // Create new template
      console.log(`Creating new template: ${latestTemplate.name}`);
      await WorkoutTemplate.create({
        name: latestTemplate.name,
        exercises: exercisesWithIds,
        isDeleted: false
      });
    }
  }
  
  console.log('Workout templates updated successfully');
};

// Update completed workouts to reference new exercise IDs
const updateCompletedWorkouts = async (backup) => {
  console.log('Updating completed workouts to reference new exercise IDs...');
  
  // Get all exercises
  const allExercises = await Exercise.find({});
  const exerciseMap = {};
  allExercises.forEach(exercise => {
    exerciseMap[exercise.name] = exercise._id;
  });
  
  // Update each completed workout
  for (const workout of backup.completedWorkouts) {
    const updatedExercises = workout.exercises.map(exercise => {
      // If the exercise already has an exerciseId, keep it
      if (exercise.exerciseId) {
        return exercise;
      }
      
      // Otherwise, try to find the exercise by name
      const exerciseId = exerciseMap[exercise.name];
      if (exerciseId) {
        return {
          ...exercise,
          exerciseId
        };
      }
      
      // If no match found, keep as is
      return exercise;
    });
    
    // Update the workout with new exercise references
    await CompletedWorkout.findByIdAndUpdate(workout._id, {
      exercises: updatedExercises
    });
  }
  
  console.log('Completed workouts updated successfully');
};

// Main function
const main = async () => {
  try {
    console.log('Starting non-interactive production database update...');
    
    // Connect to the database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }
    
    // Backup existing data
    const backup = await backupExistingData();
    
    // Update exercises
    await updateExercises();
    
    // Update workout templates
    await updateWorkoutTemplates();
    
    // Update completed workouts
    await updateCompletedWorkouts(backup);
    
    console.log('Production database updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating production database:', error);
    process.exit(1);
  }
};

// Run the script
main();
