const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gym-tracker-rawhillfish.netlify.app', process.env.FRONTEND_URL] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(compression());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
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
