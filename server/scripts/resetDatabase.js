/**
 * Script to reset the database and reinitialize with the updated schema
 * 
 * This script will:
 * 1. Drop the entire database
 * 2. Recreate the database with the updated schema
 * 3. Add default data (exercises, users, templates)
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';

async function resetDatabase() {
  try {
    console.log('=== DATABASE RESET OPERATION ===');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Step 1: Drop the database
    console.log('\nDropping database...');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');
    
    // Step 2: Create default exercises
    console.log('\nCreating default exercises...');
    const defaultExercises = [
      { name: 'Bench Press', defaultReps: 8, category: 'Chest' },
      { name: 'Shoulder Press', defaultReps: 8, category: 'Shoulders' },
      { name: 'Dips', defaultReps: 10, category: 'Chest' },
      { name: 'Tricep Extensions', defaultReps: 12, category: 'Arms' },
      { name: 'Deadlift', defaultReps: 5, category: 'Back' },
      { name: 'Barbell Row', defaultReps: 8, category: 'Back' },
      { name: 'Pull Ups', defaultReps: 8, category: 'Back' },
      { name: 'Bicep Curls', defaultReps: 12, category: 'Arms' },
      { name: 'Barbell Squat', defaultReps: 8, category: 'Legs (Quads)' },
      { name: 'Romanian Deadlift', defaultReps: 10, category: 'Legs (Hamstring)' },
      { name: 'Leg Press', defaultReps: 12, category: 'Legs (Quads)' },
      { name: 'Calf Raises', defaultReps: 15, category: 'Legs (Calves)' },
      { name: 'Bulgarian Split Squat', defaultReps: 10, category: 'Legs (Glutes)' },
      { name: 'Belt Squat', defaultReps: 10, category: 'Legs (Quads)' },
      { name: 'Military Shoulder Press', defaultReps: 10, category: 'Shoulders' },
      { name: 'Seal Barbell Row', defaultReps: 10, category: 'Back' },
      { name: 'Hammer Curls', defaultReps: 10, category: 'Arms' },
      { name: 'Dumbbell Reverse Flies', defaultReps: 10, category: 'Shoulders' },
      { name: 'Face Pulls', defaultReps: 10, category: 'Shoulders' }
    ];
    
    // Create exercises with exerciseId set
    const createdExercises = await Promise.all(
      defaultExercises.map(async (exercise) => {
        const newExercise = new Exercise(exercise);
        const saved = await newExercise.save();
        console.log(`Created exercise: ${saved.name} with ID: ${saved._id}`);
        return saved;
      })
    );
    
    // Step 3: Create default users
    console.log('\nCreating default users...');
    const defaultUsers = [
      { name: 'Jason', color: '#4ECDC4' },
      { name: 'Andrew', color: '#FF6B6B' }
    ];
    
    const createdUsers = await Promise.all(
      defaultUsers.map(async (user) => {
        const newUser = new User(user);
        const saved = await newUser.save();
        console.log(`Created user: ${saved.name} with ID: ${saved._id}`);
        return saved;
      })
    );
    
    // Step 4: Create default workout templates
    console.log('\nCreating default workout templates...');
    
    // Create a map of exercise names to objects for easy lookup
    const exerciseMap = {};
    createdExercises.forEach(ex => {
      exerciseMap[ex.name] = ex;
    });
    
    // Helper function to find exercise by name and get its ID
    const findExerciseIdByName = (name) => {
      const exercise = exerciseMap[name];
      if (!exercise) {
        console.warn(`Exercise not found: ${name}`);
        return null;
      }
      return exercise._id;
    };
    
    // Define templates - using the current 4 saved workout templates
    const templates = [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      }
    ];
    
    // Create templates
    const createdTemplates = await Promise.all(
      templates.map(async (template) => {
        const newTemplate = new WorkoutTemplate(template);
        const saved = await newTemplate.save();
        console.log(`Created template: ${saved.name} with ID: ${saved._id}`);
        
        // Log exercises for this template
        saved.exercises.forEach(exercise => {
          console.log(`  Exercise: ${exercise.name}, ID: ${exercise.exerciseId}`);
        });
        
        return saved;
      })
    );
    
    console.log('\n=== DATABASE RESET COMPLETE ===');
    console.log(`Created ${createdExercises.length} exercises`);
    console.log(`Created ${createdTemplates.length} workout templates`);
    console.log(`Created ${createdUsers.length} users`);
    
  } catch (error) {
    console.error('Error during database reset:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the reset operation
resetDatabase();
