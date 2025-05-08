const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Exercise = require('./models/Exercise');
const WorkoutTemplate = require('./models/WorkoutTemplate');
const Auth = require('./models/Auth');

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

// Seed Authentication Records
const seedAuth = async (users) => {
  try {
    // Clear existing auth records
    await Auth.deleteMany({});
    
    // Create auth records for each user
    const authRecords = await Promise.all(users.map(async (user) => {
      let email, password, isAdmin = false;
      
      // Set specific credentials for known users
      if (user.name === 'Jason') {
        email = 'jason@example.com';
        isAdmin = true; // Make Jason an admin
      } else if (user.name === 'Andrew') {
        email = 'andrew@example.com';
      } else {
        // For default or other users, generate an email based on name
        email = `${user.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      }
      
      // Use the same password for all users in development
      password = 'password123';
      
      // Create the auth record
      return Auth.create({
        email,
        password, // This will be hashed by the pre-save hook
        userId: user._id,
        isAdmin // Set the admin status
      });
    }));
    
    console.log('Auth records seeded successfully:', authRecords.length);
    
    // Log the login credentials
    console.log('\nLogin credentials:');
    users.forEach((user, index) => {
      console.log(`${user.name}:`);
      console.log(`  Email: ${authRecords[index].email}`);
      console.log(`  Password: password123`);
      if (authRecords[index].isAdmin) {
        console.log(`  Role: Admin`);
      } else {
        console.log(`  Role: User`);
      }
    });
    
    return authRecords;
  } catch (error) {
    console.error('Error seeding auth records:', error);
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
const seedWorkoutTemplates = async (users) => {
  try {
    // Clear existing workout templates
    await WorkoutTemplate.deleteMany({});
    
    // Get all exercises
    const exercises = await Exercise.find({});
    
    // Find specific exercises for templates
    const findExercise = (name) => {
      const exercise = exercises.find(e => e.name === name);
      if (!exercise) {
        console.error(`Exercise not found: ${name}`);
        return null;
      }
      return exercise;
    };
    
    // Create template helper function
    const createTemplate = (name, description, exerciseNames, userId = null) => {
      const templateExercises = exerciseNames.map(name => {
        const exercise = findExercise(name);
        if (!exercise) return null;
        
        return {
          exerciseId: exercise._id.toString(),
          name: exercise.name,
          category: exercise.category,
          sets: 3,
          reps: exercise.defaultReps || 8
        };
      }).filter(Boolean); // Remove any null entries
      
      return {
        name,
        description,
        exercises: templateExercises,
        userId // null for global templates, user ID for user-specific templates
      };
    };
    
    // Find Jason's user ID for user-specific templates
    const jasonUser = users.find(user => user.name === 'Jason');
    const jasonId = jasonUser ? jasonUser._id : null;
    
    // Find Andrew's user ID for user-specific templates
    const andrewUser = users.find(user => user.name === 'Andrew');
    const andrewId = andrewUser ? andrewUser._id : null;
    
    // Create templates
    const templateData = [
      // Global templates (userId: null)
      createTemplate(
        '2DFB (1/4) Barbell Squat',
        'A 2-day full body workout starting with barbell squats',
        ['Barbell Squat', 'Belt Squat', 'Pull Ups', 'Military Shoulder Press'],
        null // Global template
      ),
      createTemplate(
        '2DFB (2/4) Bench Press',
        'A 2-day full body workout starting with bench press',
        ['Bench Press', 'Seal Barbell Row', 'Bulgarian Split Squat', 'Deadlift'],
        null // Global template
      ),
      createTemplate(
        '2DFB (3/4) Deadlift',
        'A 2-day full body workout starting with deadlifts',
        ['Deadlift', 'Bench Press', 'Seal Barbell Row', 'Bulgarian Split Squat'],
        null // Global template
      ),
      createTemplate(
        '2DFB (4/4) Barbell Row',
        'A 2-day full body workout starting with barbell rows',
        ['Seal Barbell Row', 'Military Shoulder Press', 'Pull Ups', 'Deadlift'],
        null // Global template
      ),
      
      // Jason's personal templates
      createTemplate(
        'Jason\'s Push Day',
        'Jason\'s personal push workout routine',
        ['Bench Press', 'Military Shoulder Press', 'Dips', 'Tricep Extensions'],
        jasonId
      ),
      
      // Andrew's personal templates
      createTemplate(
        'Andrew\'s Pull Day',
        'Andrew\'s personal pull workout routine',
        ['Pull Ups', 'Seal Barbell Row', 'Bicep Curls', 'Deadlift'],
        andrewId
      )
    ];
    
    // Create templates in database
    const templates = await WorkoutTemplate.create(templateData);
    
    console.log(`${templates.length} workout templates seeded successfully`);
    
    // Log template details
    templates.forEach((template, index) => {
      console.log(`Template: (${index + 1}/${templates.length}) ${template.name}, ID: ${template._id}`);
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
    
    // Seed users first
    const users = await seedUsers();
    
    // Seed auth records with user references
    const authRecords = await seedAuth(users);
    
    // Seed exercises
    const exercises = await seedExercises();
    
    // Seed workout templates with user references
    const templates = await seedWorkoutTemplates(users);
    
    console.log('Database seeded successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
