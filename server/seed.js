const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Exercise = require('./models/Exercise');
const WorkoutTemplate = require('./models/WorkoutTemplate');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create default users
    const users = await User.create([
      { name: 'Jason', color: '#2196f3' },
      { name: 'Andrew', color: '#f44336' }
    ]);
    
    console.log('Users seeded successfully:', users);
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed Exercises
const seedExercises = async () => {
  try {
    // Clear existing exercises
    await Exercise.deleteMany({});
    
    // Create default exercises
    const exercises = await Exercise.create([
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
    ]);
    
    console.log(`${exercises.length} exercises seeded successfully`);
    return exercises;
  } catch (error) {
    console.error('Error seeding exercises:', error);
    throw error;
  }
};

// Seed Workout Templates
const seedWorkoutTemplates = async () => {
  try {
    // Clear existing templates
    await WorkoutTemplate.deleteMany({});
    
    // Get all exercises to reference in templates
    const allExercises = await Exercise.find({});
    
    // Create templates with exercise references
    const pushTemplate = {
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 10 },
        { name: 'Military Shoulder Press', sets: 3, reps: 10 },
        { name: 'Dumbbell Reverse Flies', sets: 3, reps: 10 },
        { name: 'Tricep Extensions', sets: 3, reps: 10 }
      ]
    };
    
    const pullTemplate = {
      name: 'Pull Day',
      exercises: [
        { name: 'Deadlift', sets: 3, reps: 10 },
        { name: 'Seal Barbell Row', sets: 3, reps: 10 },
        { name: 'Pull Ups', sets: 3, reps: 10 },
        { name: 'Bicep Curls', sets: 3, reps: 10 },
        { name: 'Hammer Curls', sets: 3, reps: 10 }
      ]
    };
    
    const legTemplate = {
      name: 'Leg Day',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: 10 },
        { name: 'Belt Squat', sets: 3, reps: 10 },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 10 },
        { name: 'Romanian Deadlift', sets: 3, reps: 10 },
        { name: 'Calf Raises', sets: 3, reps: 10 }
      ]
    };
    
    const templates = await WorkoutTemplate.create([
      pushTemplate,
      pullTemplate,
      legTemplate
    ]);
    
    console.log(`${templates.length} workout templates seeded successfully`);
    return templates;
  } catch (error) {
    console.error('Error seeding workout templates:', error);
    throw error;
  }
};

// Main function to run all seed operations
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Run seed functions
    await seedUsers();
    await seedExercises();
    await seedWorkoutTemplates();
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
