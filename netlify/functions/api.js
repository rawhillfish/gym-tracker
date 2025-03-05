// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import your routes
const exercisesRouter = require('../../server/routes/exercises');
const workoutsRouter = require('../../server/routes/workouts');
const usersRouter = require('../../server/routes/users');
const completedWorkoutsRouter = require('../../server/routes/completedWorkouts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/exercises', exercisesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/users', usersRouter);
app.use('/api/completed-workouts', completedWorkoutsRouter);

// Connect to MongoDB (use environment variable in production)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Export the serverless function
module.exports.handler = serverless(app);
