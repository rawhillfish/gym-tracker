const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CompletedWorkout = require('../models/CompletedWorkout');

// Get all users
router.get('/', async (req, res) => {
  try {
    // Check if we should include deleted users
    const includeDeleted = req.query.includeDeleted === 'true';
    
    // Build query
    let query = {};
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    const users = await User.find(query).sort('name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const user = new User({
    name: req.body.name,
    color: req.body.color,
    isDeleted: false
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete a user
router.delete('/:id', async (req, res) => {
  try {
    // Find the user first to make sure it exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if this user has any completed workouts
    const workoutCount = await CompletedWorkout.countDocuments({ user: req.params.id });
    
    // Update the user to mark it as deleted
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    
    res.json({ 
      message: 'User successfully marked as deleted',
      user,
      hasWorkouts: workoutCount > 0,
      workoutCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore a soft-deleted user
router.patch('/:id/restore', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isDeleted) {
      return res.status(400).json({ message: 'User is not deleted' });
    }
    
    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();
    
    res.json({ 
      message: 'User successfully restored',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hard delete a user (permanent deletion)
router.delete('/:id/permanent', async (req, res) => {
  try {
    // Find the user first to make sure it exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user is already soft-deleted
    if (!user.isDeleted) {
      return res.status(400).json({ 
        message: 'User must be soft-deleted before permanent deletion. Use the regular delete endpoint first.' 
      });
    }
    
    // Check if this user has any completed workouts
    const workoutCount = await CompletedWorkout.countDocuments({ user: req.params.id });
    
    if (workoutCount > 0) {
      return res.status(400).json({
        message: `Cannot permanently delete user with ${workoutCount} associated workouts. Consider keeping the user in retired state.`,
        hasWorkouts: true,
        workoutCount
      });
    }
    
    // Perform the hard deletion
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'User permanently deleted',
      userId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
