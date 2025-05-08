/**
 * Script to populate the database with completed workouts
 * Creates 15 completed workouts for each template spanning over the last 6 months
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const CompletedWorkout = require('../models/CompletedWorkout');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected for populating completed workouts');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate a random date within the last 6 months
const getRandomDateInLast6Months = () => {
  const now = new Date();
  // Get a date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  // Random time between now and 6 months ago
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

// Generate random workout duration between 30 and 90 minutes (in milliseconds)
const getRandomWorkoutDuration = () => {
  // Between 30 and 90 minutes in milliseconds
  return (30 + Math.floor(Math.random() * 60)) * 60 * 1000;
};

// Generate random weight for a set based on exercise name
const getRandomWeight = (exerciseName) => {
  // Define weight ranges for different exercises
  const weightRanges = {
    'Bench Press': { min: 60, max: 100 },
    'Shoulder Press': { min: 40, max: 70 },
    'Dips': { min: 0, max: 20 }, // Bodyweight or weighted
    'Tricep Extensions': { min: 15, max: 30 },
    'Deadlift': { min: 100, max: 180 },
    'Barbell Row': { min: 60, max: 100 },
    'Pull Ups': { min: 0, max: 20 }, // Bodyweight or weighted
    'Bicep Curls': { min: 15, max: 30 },
    'Barbell Squat': { min: 80, max: 150 },
    'Romanian Deadlift': { min: 70, max: 120 },
    'Leg Press': { min: 100, max: 200 },
    'Calf Raises': { min: 40, max: 80 },
    'Bulgarian Split Squat': { min: 20, max: 40 },
    'Belt Squat': { min: 60, max: 120 },
    'Military Shoulder Press': { min: 40, max: 70 },
    'Seal Barbell Row': { min: 60, max: 100 },
    'Hammer Curls': { min: 15, max: 30 },
    'Dumbbell Reverse Flies': { min: 10, max: 20 },
    'Face Pulls': { min: 15, max: 30 }
  };

  // Get the weight range for the exercise, or use a default range
  const range = weightRanges[exerciseName] || { min: 20, max: 50 };
  
  // Generate a random weight within the range
  return Math.floor(range.min + Math.random() * (range.max - range.min));
};

// Generate random reps for a set based on target reps
const getRandomReps = (targetReps) => {
  // Generate reps within +/- 2 of target, but at least 1
  const variation = Math.floor(Math.random() * 5) - 2;
  return Math.max(1, targetReps + variation);
};

// Generate a completed workout from a template
const generateCompletedWorkout = (template, user, startDate) => {
  // Calculate end time (start time + random duration)
  const endDate = new Date(startDate.getTime() + getRandomWorkoutDuration());
  
  // Create exercises with completed sets
  const exercises = template.exercises.map(templateExercise => {
    // Create sets for this exercise
    const sets = Array.from({ length: templateExercise.sets }, () => {
      // Generate random weight and reps
      const weight = getRandomWeight(templateExercise.name);
      const reps = getRandomReps(templateExercise.reps);
      
      return {
        weight,
        reps,
        completed: true // All sets are completed
      };
    });
    
    return {
      exerciseId: templateExercise.exerciseId,
      name: templateExercise.name,
      sets
    };
  });
  
  // Create the completed workout with both user and userId fields
  return {
    templateId: template._id,
    templateName: template.name,
    startTime: startDate,
    endTime: endDate,
    exercises,
    user: user._id,
    userId: user._id // Add userId field for backward compatibility
  };
};

// Populate completed workouts
const populateCompletedWorkouts = async () => {
  try {
    // Clear existing completed workouts
    await CompletedWorkout.deleteMany({});
    console.log('Cleared existing completed workouts');
    
    // Get all users
    const allUsers = await User.find({});
    if (allUsers.length === 0) {
      console.error('No users found. Please run seed.js first.');
      process.exit(1);
    }
    
    // Filter for only Jason and Andrew
    const users = allUsers.filter(user => user.name === 'Jason' || user.name === 'Andrew');
    
    if (users.length === 0) {
      console.error('Neither Jason nor Andrew found in users. Please check user data.');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} matching users: ${users.map(u => u.name).join(', ')}`);
    
    // Get all workout templates
    const templates = await WorkoutTemplate.find({});
    if (templates.length === 0) {
      console.error('No workout templates found. Please run seed.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${templates.length} templates`);
    
    // Generate 15 completed workouts for each template
    const completedWorkouts = [];
    
    for (const template of templates) {
      console.log(`Generating completed workouts for template: ${template.name}`);
      
      // Create 15 workouts per template (alternating between users)
      for (let i = 0; i < 15; i++) {
        // Alternate between users
        const user = users[i % users.length];
        
        // Generate a random date within the last 6 months
        const startDate = getRandomDateInLast6Months();
        
        // Generate the completed workout
        const completedWorkout = generateCompletedWorkout(template, user, startDate);
        completedWorkouts.push(completedWorkout);
      }
    }
    
    // Sort workouts by date (oldest first)
    completedWorkouts.sort((a, b) => a.startTime - b.startTime);
    
    // Save all completed workouts
    const savedWorkouts = await CompletedWorkout.create(completedWorkouts);
    
    console.log(`Successfully created ${savedWorkouts.length} completed workouts`);
    
    // Log some details about the created workouts
    console.log('\nSample of created workouts:');
    for (let i = 0; i < Math.min(5, savedWorkouts.length); i++) {
      const workout = savedWorkouts[i];
      // Find the user to display the name
      const workoutUser = users.find(u => u._id.toString() === workout.user.toString());
      const userName = workoutUser ? workoutUser.name : 'Unknown User';
      
      console.log(`- ${workout.templateName} by ${userName} on ${workout.startTime.toLocaleDateString()}`);
      console.log(`  Duration: ${Math.round((workout.endTime - workout.startTime) / (60 * 1000))} minutes`);
      console.log(`  Exercises: ${workout.exercises.length}`);
      console.log(`  Total sets: ${workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}`);
    }
    
    return savedWorkouts;
  } catch (error) {
    console.error('Error populating completed workouts:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await populateCompletedWorkouts();
    console.log('Completed workouts population finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the main function
main();
