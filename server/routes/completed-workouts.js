const express = require('express');
const router = express.Router();
const Workout = require('../models/CompletedWorkout');
const User = require('../models/User');

// Get all workouts
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { user: userId } : {};
    const workouts = await Workout.find(query)
      .populate('user', 'name color')
      .sort({ startTime: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new workout
router.post('/', async (req, res) => {
  try {
    console.log('Received workout data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.exercises || !Array.isArray(req.body.exercises)) {
      throw new Error('Exercises array is required');
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const workout = new Workout({
      templateName: req.body.templateName,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      exercises: req.body.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets
      })),
      user: user._id
    });

    console.log('Created workout document:', JSON.stringify(workout, null, 2));
    const newWorkout = await workout.save();
    console.log('Workout saved successfully:', JSON.stringify(newWorkout, null, 2));
    const populatedWorkout = await Workout.findById(newWorkout._id).populate('user', 'name color');
    res.status(201).json(populatedWorkout);
  } catch (error) {
    console.error('Error saving workout:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({ 
      message: error.message,
      details: error.toString(),
      stack: error.stack
    });
  }
});

// Update a workout
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating workout:', req.params.id);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    // Validate the request body
    if (!req.body.exercises || !Array.isArray(req.body.exercises)) {
      return res.status(400).json({ message: 'Exercises array is required' });
    }
    
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name color');
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    console.log('Workout updated successfully');
    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.toString()
    });
  }
});

// Delete a workout
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
