const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');

// Get all exercises
router.get('/', async (req, res) => {
  try {
    // Check if we should include deleted exercises
    const includeDeleted = req.query.includeDeleted === 'true';
    
    // Build query
    let query = {};
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const exercises = await Exercise.find(query).sort('name');
    console.log(`Found ${exercises.length} exercises with query:`, query);
    console.log('Include deleted exercises:', includeDeleted);
    
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single exercise
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new exercise
router.post('/', async (req, res) => {
  const exercise = new Exercise({
    name: req.body.name,
    defaultReps: req.body.defaultReps,
    category: req.body.category,
    description: req.body.description,
    isDeleted: req.body.isDeleted || false
  });

  try {
    const newExercise = await exercise.save();
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an exercise
router.put('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete an exercise
router.delete('/:id', async (req, res) => {
  try {
    // Find the exercise first to make sure it exists
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Update the exercise to mark it as deleted
    exercise.isDeleted = true;
    exercise.deletedAt = new Date();
    await exercise.save();
    
    res.json({ 
      message: 'Exercise successfully marked as deleted',
      exercise
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore a soft-deleted exercise
router.patch('/:id/restore', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    if (!exercise.isDeleted) {
      return res.status(400).json({ message: 'Exercise is not deleted' });
    }
    
    exercise.isDeleted = false;
    exercise.deletedAt = null;
    await exercise.save();
    
    res.json({ 
      message: 'Exercise successfully restored',
      exercise
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk create exercises (for initial setup)
router.post('/bulk', async (req, res) => {
  try {
    if (!req.body.exercises || !Array.isArray(req.body.exercises)) {
      return res.status(400).json({ message: 'Exercises array is required' });
    }
    
    // Ensure all exercises have isDeleted set to false
    const exercisesWithSoftDelete = req.body.exercises.map(exercise => ({
      ...exercise,
      isDeleted: false,
      deletedAt: null
    }));
    
    const result = await Exercise.insertMany(exercisesWithSoftDelete);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Hard delete an exercise (permanent deletion)
router.delete('/:id/permanent', async (req, res) => {
  try {
    // Find the exercise first to make sure it exists
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Check if the exercise is already soft-deleted
    if (!exercise.isDeleted) {
      return res.status(400).json({ 
        message: 'Exercise must be soft-deleted before permanent deletion. Use the regular delete endpoint first.' 
      });
    }
    
    // Perform the hard deletion
    await Exercise.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Exercise permanently deleted',
      exerciseId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fix all exercise IDs
router.post('/fix-ids', async (req, res) => {
  try {
    console.log('Starting to fix exercise IDs');
    
    // Get all exercises
    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises to check`);
    
    let updatedCount = 0;
    
    // Update exercises without exerciseId
    for (const exercise of exercises) {
      if (!exercise.exerciseId) {
        exercise.exerciseId = exercise._id.toString();
        await exercise.save();
        updatedCount++;
        console.log(`Updated exercise ${exercise.name} with exerciseId ${exercise.exerciseId}`);
      }
    }
    
    console.log(`Fixed ${updatedCount} exercises`);
    res.json({ message: `Fixed ${updatedCount} exercises` });
  } catch (error) {
    console.error('Error fixing exercise IDs:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
