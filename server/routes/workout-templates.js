const express = require('express');
const router = express.Router();
const WorkoutTemplate = require('../models/WorkoutTemplate');
const mongoose = require('mongoose');

// Get all workout templates
router.get('/', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    let query = {};
    
    // If not including deleted, filter them out
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    const templates = await WorkoutTemplate.find(query).sort('-createdAt');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single workout template
router.get('/:id', async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new workout template
router.post('/', async (req, res) => {
  const template = new WorkoutTemplate({
    name: req.body.name,
    description: req.body.description,
    exercises: req.body.exercises
  });

  try {
    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a workout template
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating workout template:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // First get the existing template
    const existingTemplate = await WorkoutTemplate.findById(req.params.id);
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Update fields individually to avoid issues with nested arrays
    existingTemplate.name = req.body.name;
    existingTemplate.description = req.body.description;
    
    // Handle exercises separately to ensure proper updating
    if (req.body.exercises && Array.isArray(req.body.exercises)) {
      // Validate that each exercise has a valid exerciseId
      const validExercises = req.body.exercises.map(exercise => {
        // Ensure exerciseId is present, or generate one if missing
        const exerciseId = exercise.exerciseId || 
                          exercise._id || 
                          `exercise-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create a clean exercise object without problematic _id field
        const cleanExercise = {
          exerciseId: exerciseId,
          name: exercise.name,
          category: exercise.category,
          sets: parseInt(exercise.sets) || 3,
          reps: parseInt(exercise.reps) || 10
        };
        
        // Only add _id if it's a valid ObjectId, otherwise omit it
        if (exercise._id) {
          try {
            if (mongoose.Types.ObjectId.isValid(exercise._id)) {
              cleanExercise._id = exercise._id;
            } else {
              console.log(`Skipping invalid _id: ${exercise._id} for exercise: ${exercise.name}`);
            }
          } catch (err) {
            console.log(`Error processing _id: ${err.message}`);
          }
        }
        
        return cleanExercise;
      });
      
      console.log('Processed exercises for update:', JSON.stringify(validExercises, null, 2));
      existingTemplate.exercises = validExercises;
    }
    
    // Save the updated template
    const updatedTemplate = await existingTemplate.save();
    console.log('Template updated successfully');
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating workout template:', error);
    res.status(400).json({ message: error.message });
  }
});

// Soft delete (retire) a workout template
router.delete('/:id', async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Soft delete by setting isDeleted flag and deletedAt timestamp
    template.isDeleted = true;
    template.deletedAt = new Date();
    await template.save();
    
    res.json({ message: 'Workout template retired successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore a retired workout template
router.patch('/:id/restore', async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Restore by clearing isDeleted flag and deletedAt timestamp
    template.isDeleted = false;
    template.deletedAt = null;
    await template.save();
    
    res.json({ message: 'Workout template restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hard delete a workout template
router.delete('/:id/permanent', async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Only allow hard deletion of retired templates
    if (!template.isDeleted) {
      return res.status(400).json({ 
        message: 'Cannot permanently delete an active template. Retire it first.' 
      });
    }
    
    // Perform the hard delete
    await WorkoutTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout template permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import templates from localStorage (for migration)
router.post('/import', async (req, res) => {
  try {
    if (!req.body.templates || !Array.isArray(req.body.templates)) {
      return res.status(400).json({ message: 'Templates array is required' });
    }
    
    const result = await WorkoutTemplate.insertMany(req.body.templates);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
