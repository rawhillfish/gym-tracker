/**
 * Script to reset workout templates in the production database
 * 
 * Usage: NODE_ENV=production node scripts/reset-production-templates.js
 * 
 * This script will:
 * 1. Connect to the production MongoDB database
 * 2. Delete all existing workout templates
 * 3. Create the 4 new workout templates
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env.production
console.log('Loading environment from .env.production');
dotenv.config({ path: path.resolve(__dirname, '..', '.env.production') });

// Import models
const Exercise = require('../models/Exercise');
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Reset workout templates
const resetWorkoutTemplates = async () => {
  try {
    console.log('Deleting all existing workout templates...');
    await WorkoutTemplate.deleteMany({});
    console.log('All workout templates deleted');
    
    // Get all exercises to reference in templates
    console.log('Fetching exercises...');
    const allExercises = await Exercise.find({});
    console.log(`Found ${allExercises.length} exercises`);
    
    if (allExercises.length === 0) {
      console.error('No exercises found. Cannot create templates.');
      return false;
    }
    
    // Helper function to find exercise by name and get its ID
    const findExerciseIdByName = (name) => {
      const exercise = allExercises.find(e => e.name === name);
      if (!exercise) {
        console.warn(`Exercise not found: ${name}`);
        return null;
      }
      return exercise._id;
    };
    
    // Define templates - using the current 4 saved workout templates
    console.log('Creating new workout templates...');
    const template1 = {
      name: '2DFB (1/4) Barbell Squat',
      description: '',
      exercises: [
        {
          name: 'Barbell Squat',
          category: 'Legs (Quads)',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Barbell Squat')
        },
        {
          name: 'Belt Squat',
          category: 'Legs (Quads)',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Belt Squat')
        },
        {
          name: 'Pull Ups',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Pull Ups')
        },
        {
          name: 'Military Shoulder Press',
          category: 'Shoulders',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Military Shoulder Press')
        }
      ]
    };
    
    const template2 = {
      name: '2DFB (2/4) Bench Press',
      description: '',
      exercises: [
        {
          name: 'Bench Press',
          category: 'Chest',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Bench Press')
        },
        {
          name: 'Seal Barbell Row',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Seal Barbell Row')
        },
        {
          name: 'Bulgarian Split Squat',
          category: 'Legs (Glutes)',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Bulgarian Split Squat')
        },
        {
          name: 'Deadlift',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Deadlift')
        }
      ]
    };
    
    const template3 = {
      name: '2DFB (3/4) Deadlift',
      description: '',
      exercises: [
        {
          name: 'Deadlift',
          category: 'Back',
          sets: 5,
          reps: 5,
          exerciseId: findExerciseIdByName('Deadlift')
        },
        {
          name: 'Bench Press',
          category: 'Chest',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Bench Press')
        },
        {
          name: 'Seal Barbell Row',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Seal Barbell Row')
        },
        {
          name: 'Bulgarian Split Squat',
          category: 'Legs (Glutes)',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Bulgarian Split Squat')
        }
      ]
    };
    
    const template4 = {
      name: '2DFB (4/4) Barbell Row',
      description: '',
      exercises: [
        {
          name: 'Seal Barbell Row',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Seal Barbell Row')
        },
        {
          name: 'Military Shoulder Press',
          category: 'Shoulders',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Military Shoulder Press')
        },
        {
          name: 'Pull Ups',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Pull Ups')
        },
        {
          name: 'Deadlift',
          category: 'Back',
          sets: 3,
          reps: 10,
          exerciseId: findExerciseIdByName('Deadlift')
        }
      ]
    };
    
    // Create the templates
    const templates = await WorkoutTemplate.create([
      template1,
      template2,
      template3,
      template4
    ]);
    
    console.log(`Created ${templates.length} workout templates successfully`);
    
    // Log the created templates with their IDs for reference
    templates.forEach(template => {
      console.log(`Template: ${template.name}, ID: ${template._id}`);
      template.exercises.forEach(exercise => {
        console.log(`  Exercise: ${exercise.name}, ID: ${exercise.exerciseId}`);
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error resetting workout templates:', error);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }
    
    // Confirm with user
    rl.question('You are about to RESET ALL WORKOUT TEMPLATES in the PRODUCTION database. This will delete all existing templates. Are you sure you want to continue? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Operation cancelled by user');
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      }
      
      // Reset workout templates
      const success = await resetWorkoutTemplates();
      
      if (success) {
        console.log('Production workout templates reset successfully!');
      } else {
        console.error('Failed to reset production workout templates');
      }
      
      // Close connections
      rl.close();
      await mongoose.disconnect();
      process.exit(success ? 0 : 1);
    });
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the script
main();
