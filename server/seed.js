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
      { name: 'Default User', color: '#2196f3' },
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
    
    // Helper function to find exercise by name and get its ID
    const findExerciseIdByName = (name) => {
      const exercise = allExercises.find(e => e.name === name);
      if (!exercise) {
        console.warn(`Exercise not found: ${name}`);
        return null;
      }
      return exercise._id;
    };
    
    // Create templates with exercise references and explicit exerciseId
    // Using the current 4 saved workout templates
    const template1 = {
      name: '(1/4) 2DFB Barbell Squat',
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
      name: '(2/4) 2DFB Bench Press',
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
      name: '(3/4) 32DFB Deadlift',
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
      name: '(4/4) 2DFB Barbell Row',
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
    
    console.log(`${templates.length} workout templates seeded successfully`);
    
    // Log the created templates with their IDs for reference
    templates.forEach(template => {
      console.log(`Template: ${template.name}, ID: ${template._id}`);
      template.exercises.forEach(exercise => {
        console.log(`  Exercise: ${exercise.name}, ID: ${exercise.exerciseId}`);
      });
    });
    
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
