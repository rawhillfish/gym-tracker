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
      { name: 'Sarah', color: '#f44336' },
      { name: 'Mike', color: '#4caf50' }
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
      { name: 'Bench Press', defaultReps: 8, category: 'Chest' },
      { name: 'Squat', defaultReps: 8, category: 'Legs' },
      { name: 'Deadlift', defaultReps: 8, category: 'Back' },
      { name: 'Shoulder Press', defaultReps: 8, category: 'Shoulders' },
      { name: 'Barbell Row', defaultReps: 8, category: 'Back' },
      { name: 'Pull Ups', defaultReps: 8, category: 'Back' },
      { name: 'Dips', defaultReps: 8, category: 'Chest' },
      { name: 'Bicep Curls', defaultReps: 12, category: 'Arms' },
      { name: 'Tricep Extensions', defaultReps: 12, category: 'Arms' },
      { name: 'Leg Press', defaultReps: 12, category: 'Legs' },
      { name: 'Calf Raises', defaultReps: 15, category: 'Legs' },
      { name: 'Lateral Raises', defaultReps: 15, category: 'Shoulders' },
      { name: 'Face Pulls', defaultReps: 15, category: 'Shoulders' }
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
        { name: 'Bench Press', sets: 4, reps: 8 },
        { name: 'Shoulder Press', sets: 3, reps: 10 },
        { name: 'Dips', sets: 3, reps: 12 },
        { name: 'Tricep Extensions', sets: 3, reps: 12 }
      ]
    };
    
    const pullTemplate = {
      name: 'Pull Day',
      exercises: [
        { name: 'Deadlift', sets: 3, reps: 8 },
        { name: 'Barbell Row', sets: 3, reps: 10 },
        { name: 'Pull Ups', sets: 3, reps: 8 },
        { name: 'Bicep Curls', sets: 3, reps: 12 }
      ]
    };
    
    const legTemplate = {
      name: 'Leg Day',
      exercises: [
        { name: 'Squat', sets: 4, reps: 8 },
        { name: 'Leg Press', sets: 3, reps: 12 },
        { name: 'Calf Raises', sets: 3, reps: 15 }
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
