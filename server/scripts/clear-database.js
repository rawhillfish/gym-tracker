/**
 * Script to clear the database and re-seed with initial data
 * 
 * Usage: node scripts/clear-database.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
console.log(`Loading environment from ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

// Import models
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const CompletedWorkout = require('../models/CompletedWorkout');

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

// Clear all collections
const clearDatabase = async () => {
  try {
    console.log('Clearing database collections...');
    
    await User.deleteMany({});
    console.log('Users collection cleared');
    
    await Exercise.deleteMany({});
    console.log('Exercises collection cleared');
    
    await WorkoutTemplate.deleteMany({});
    console.log('WorkoutTemplates collection cleared');
    
    await CompletedWorkout.deleteMany({});
    console.log('CompletedWorkouts collection cleared');
    
    console.log('All collections cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

// Seed initial data
const seedDatabase = async () => {
  try {
    console.log('Seeding database with initial data...');
    
    // Seed Users
    const users = await User.create([
      { name: 'Jason', color: '#2196f3' },
      { name: 'Sarah', color: '#f44336' },
      { name: 'Mike', color: '#4caf50' }
    ]);
    console.log(`${users.length} users seeded successfully`);
    
    // Seed Exercises
    const exercises = await Exercise.create([
      { name: 'Bench Press', defaultReps: 8, category: 'Chest', isDeleted: false },
      { name: 'Squat', defaultReps: 8, category: 'Legs (Quads)', isDeleted: false },
      { name: 'Deadlift', defaultReps: 8, category: 'Back', isDeleted: false },
      { name: 'Shoulder Press', defaultReps: 8, category: 'Shoulders', isDeleted: false },
      { name: 'Barbell Row', defaultReps: 8, category: 'Back', isDeleted: false },
      { name: 'Pull Ups', defaultReps: 8, category: 'Back', isDeleted: false },
      { name: 'Dips', defaultReps: 8, category: 'Chest', isDeleted: false },
      { name: 'Bicep Curls', defaultReps: 12, category: 'Arms', isDeleted: false },
      { name: 'Tricep Extensions', defaultReps: 12, category: 'Arms', isDeleted: false },
      { name: 'Leg Press', defaultReps: 12, category: 'Legs (Quads)', isDeleted: false },
      { name: 'Calf Raises', defaultReps: 15, category: 'Legs (Calves)', isDeleted: false },
      { name: 'Lateral Raises', defaultReps: 15, category: 'Shoulders', isDeleted: false },
      { name: 'Face Pulls', defaultReps: 15, category: 'Shoulders', isDeleted: false }
    ]);
    console.log(`${exercises.length} exercises seeded successfully`);
    
    // Get exercise IDs by name for template creation
    const exerciseMap = {};
    exercises.forEach(exercise => {
      exerciseMap[exercise.name] = exercise._id;
    });
    
    // Seed Workout Templates with exercise IDs
    const pushTemplate = {
      name: '2DFB (1/4) Bench Press',
      exercises: [
        { name: 'Bench Press', exerciseId: exerciseMap['Bench Press'], sets: 4, reps: 8 },
        { name: 'Shoulder Press', exerciseId: exerciseMap['Shoulder Press'], sets: 3, reps: 10 },
        { name: 'Dips', exerciseId: exerciseMap['Dips'], sets: 3, reps: 12 },
        { name: 'Tricep Extensions', exerciseId: exerciseMap['Tricep Extensions'], sets: 3, reps: 12 }
      ]
    };
    
    const pullTemplate = {
      name: '2DFB (2/4) Deadlift',
      exercises: [
        { name: 'Deadlift', exerciseId: exerciseMap['Deadlift'], sets: 3, reps: 8 },
        { name: 'Barbell Row', exerciseId: exerciseMap['Barbell Row'], sets: 3, reps: 10 },
        { name: 'Pull Ups', exerciseId: exerciseMap['Pull Ups'], sets: 3, reps: 8 },
        { name: 'Bicep Curls', exerciseId: exerciseMap['Bicep Curls'], sets: 3, reps: 12 }
      ]
    };
    
    const legTemplate = {
      name: '2DFB (3/4) Squat',
      exercises: [
        { name: 'Squat', exerciseId: exerciseMap['Squat'], sets: 4, reps: 8 },
        { name: 'Leg Press', exerciseId: exerciseMap['Leg Press'], sets: 3, reps: 12 },
        { name: 'Calf Raises', exerciseId: exerciseMap['Calf Raises'], sets: 3, reps: 15 }
      ]
    };
    
    const templates = await WorkoutTemplate.create([
      pushTemplate,
      pullTemplate,
      legTemplate
    ]);
    console.log(`${templates.length} workout templates seeded successfully`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await seedDatabase();
    console.log('Database reset and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the script
main();
