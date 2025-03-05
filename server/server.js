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
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    const exerciseCount = await Exercise.countDocuments();
    
    if (userCount === 0 && exerciseCount === 0) {
      console.log('Database appears empty. Starting automatic seeding...');
      
      // Seed Users
      const users = await User.create([
        { name: 'Jason', color: '#2196f3' },
        { name: 'Sarah', color: '#f44336' },
        { name: 'Mike', color: '#4caf50' }
      ]);
      console.log(`${users.length} users seeded successfully`);
      
      // Seed Exercises
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
      
      // Seed Workout Templates
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

// Routes
app.use('/api/completed-workouts', require('./routes/completed-workouts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/workout-templates', require('./routes/workout-templates'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set security HTTP headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Add a health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
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
