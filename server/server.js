const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
console.log(`Loading environment from ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gym-tracker-rawhillfish.netlify.app', 'https://work-it-out-tracker.netlify.app', process.env.FRONTEND_URL, 'https://gym-tracker-rawhillfish.netlify.app/', 'https://work-it-out-tracker.netlify.app/'] 
    : '*',
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(compression());

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use different MongoDB URI for production vs development
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_PROD_URI || process.env.MONGODB_URI
      : process.env.MONGODB_URI;
    
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using MongoDB URI:', mongoURI.substring(0, 20) + '...');
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Check if database needs seeding (in production)
    if (process.env.NODE_ENV === 'production') {
      await checkAndSeedDatabase();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to check if database is empty and seed if needed
const checkAndSeedDatabase = async () => {
  try {
    // Import models
    const User = require('./models/User');
    const Exercise = require('./models/Exercise');
    const WorkoutTemplate = require('./models/WorkoutTemplate');
    const Auth = require('./models/Auth');
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    const exerciseCount = await Exercise.countDocuments();
    
    if (userCount === 0 && exerciseCount === 0) {
      console.log('Database appears empty. Starting automatic seeding...');
      
      // Seed Users
      const users = await User.create([
        { name: 'Default User', color: '#2196f3' },
        { name: 'Jason', color: '#2196f3' },
        { name: 'Andrew', color: '#f44336' }
      ]);
      console.log(`${users.length} users seeded successfully`);
      
      // Seed Auth records
      const authRecords = await Promise.all(users.map(async (user) => {
        let email;
        
        // Set specific credentials for known users
        if (user.name === 'Jason') {
          email = 'jason@example.com';
        } else if (user.name === 'Andrew') {
          email = 'andrew@example.com';
        } else {
          // For default or other users, generate an email based on name
          email = `${user.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        }
        
        // Use the same password for all users in development
        const password = 'password123';
        
        // Create the auth record
        return Auth.create({
          email,
          password, // This will be hashed by the pre-save hook
          userId: user._id
        });
      }));
      console.log(`${authRecords.length} auth records seeded successfully`);
      
      // Log the login credentials
      console.log('\nLogin credentials:');
      users.forEach((user, index) => {
        console.log(`${user.name}:`);
        console.log(`  Email: ${authRecords[index].email}`);
        console.log(`  Password: password123`);
      });
      
      // Seed Exercises
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
        { name: 'Calf Raises', defaultReps: 15, category: 'Legs (Calves)' }
      ]);
      console.log(`${exercises.length} exercises seeded successfully`);
      
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
      
      // Seed Workout Templates with exercise IDs
      const pushTemplate = {
        name: 'Push Day',
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 8,
            exerciseId: findExerciseIdByName('Bench Press'),
            category: 'Chest'
          },
          {
            name: 'Shoulder Press',
            sets: 3,
            reps: 8,
            exerciseId: findExerciseIdByName('Shoulder Press'),
            category: 'Shoulders'
          },
          {
            name: 'Dips',
            sets: 3,
            reps: 10,
            exerciseId: findExerciseIdByName('Dips'),
            category: 'Chest'
          },
          {
            name: 'Tricep Extensions',
            sets: 3,
            reps: 12,
            exerciseId: findExerciseIdByName('Tricep Extensions'),
            category: 'Arms'
          }
        ]
      };
      
      const pullTemplate = {
        name: 'Pull Day',
        exercises: [
          {
            name: 'Deadlift',
            sets: 3,
            reps: 5,
            exerciseId: findExerciseIdByName('Deadlift'),
            category: 'Back'
          },
          {
            name: 'Barbell Row',
            sets: 3,
            reps: 8,
            exerciseId: findExerciseIdByName('Barbell Row'),
            category: 'Back'
          },
          {
            name: 'Pull Ups',
            sets: 3,
            reps: 8,
            exerciseId: findExerciseIdByName('Pull Ups'),
            category: 'Back'
          },
          {
            name: 'Bicep Curls',
            sets: 3,
            reps: 12,
            exerciseId: findExerciseIdByName('Bicep Curls'),
            category: 'Arms'
          }
        ]
      };
      
      const legTemplate = {
        name: 'Leg Day',
        exercises: [
          {
            name: 'Barbell Squat',
            sets: 4,
            reps: 8,
            exerciseId: findExerciseIdByName('Barbell Squat'),
            category: 'Legs (Quads)'
          },
          {
            name: 'Romanian Deadlift',
            sets: 3,
            reps: 10,
            exerciseId: findExerciseIdByName('Romanian Deadlift'),
            category: 'Legs (Hamstring)'
          },
          {
            name: 'Leg Press',
            sets: 3,
            reps: 12,
            exerciseId: findExerciseIdByName('Leg Press'),
            category: 'Legs (Quads)'
          },
          {
            name: 'Calf Raises',
            sets: 4,
            reps: 15,
            exerciseId: findExerciseIdByName('Calf Raises'),
            category: 'Legs (Calves)'
          }
        ]
      };
      
      const templates = await WorkoutTemplate.create([
        pushTemplate,
        pullTemplate,
        legTemplate
      ]);
      
      // Log the created templates with their IDs for reference
      templates.forEach(template => {
        console.log(`Template: ${template.name}, ID: ${template._id}`);
        template.exercises.forEach(exercise => {
          console.log(`  Exercise: ${exercise.name}, ID: ${exercise.exerciseId}`);
        });
      });
      
      console.log(`${templates.length} workout templates seeded successfully`);
      console.log('Database seeding completed successfully!');
    } else {
      console.log('Database already contains data, skipping automatic seeding.');
    }
  } catch (error) {
    console.error('Error during automatic database seeding:', error);
    // Don't exit process on seeding error, just log it
  }
};

connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
const usersRouter = require('./routes/users');
const exercisesRouter = require('./routes/exercises');
const workoutTemplatesRouter = require('./routes/workout-templates');
const completedWorkoutsRouter = require('./routes/completed-workouts');
const authRouter = require('./routes/auth');

// Mount routes
app.use('/api/users', usersRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/workout-templates', workoutTemplatesRouter);
app.use('/api/completed-workouts', completedWorkoutsRouter);
app.use('/api/auth', authRouter);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set security HTTP headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check endpoint already defined above
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
