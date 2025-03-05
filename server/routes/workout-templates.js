const express = require('express');
const router = express.Router();
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Get all workout templates
router.get('/', async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find().sort('-createdAt');
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
    const template = await WorkoutTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a workout template
router.delete('/:id', async (req, res) => {
  try {
    const template = await WorkoutTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    res.json({ message: 'Workout template deleted' });
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
