const express = require('express');
const router = express.Router();
const WorkoutTemplate = require('../models/WorkoutTemplate');
const mongoose = require('mongoose');
const { protect } = require('./auth');

// Get all workout templates
router.get('/', protect, async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const includeGlobal = req.query.includeGlobal !== 'false'; // Default to true
    let query = {};
    
    // If not including deleted, filter them out
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    // Filter by user ID if provided
    if (req.user && req.user.id) {
      if (includeGlobal) {
        // Include both user-specific and global templates (userId is null)
        query.$or = [
          { userId: req.user.id },
          { userId: null }
        ];
      } else {
        // Only include user-specific templates
        query.userId = req.user.id;
      }
    }
    
    const templates = await WorkoutTemplate.find(query).sort('-createdAt');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single workout template
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Check if the template belongs to the user or is global
    if (template.userId && template.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this template' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new workout template
router.post('/', protect, async (req, res) => {
  try {
    // Determine if this is a global template (admin only) or user-specific
    let userId = req.user.id;
    
    // If isGlobal is true and user is admin, set userId to null (global template)
    if (req.body.isGlobal === true && req.user.isAdmin) {
      userId = null;
    } else if (req.body.isGlobal === true && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admin users can create global templates' });
    }
    
    const template = new WorkoutTemplate({
      name: req.body.name,
      description: req.body.description,
      exercises: req.body.exercises,
      userId: userId
    });

    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a workout template
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('Update template request received for ID:', req.params.id);
    console.log('User making the request:', req.user);
    console.log('Request body:', req.body);
    
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      console.log('Template not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    console.log('Template found:', template);
    
    // Check if user is authorized to update this template
    // Allow if: 1) User owns the template, or 2) Template is global and user is admin
    const isOwner = template.userId && template.userId.toString() === req.user.id.toString();
    const isGlobalAndAdmin = template.userId === null && req.user.isAdmin;
    
    console.log('Authorization check:', {
      isOwner,
      isGlobalAndAdmin,
      templateUserId: template.userId ? template.userId.toString() : null,
      requestUserId: req.user.id.toString(),
      userIsAdmin: req.user.isAdmin,
      templateUserIdType: template.userId ? typeof template.userId : 'null',
      requestUserIdType: typeof req.user.id,
      areEqual: template.userId && template.userId.toString() === req.user.id.toString()
    });
    
    if (!isOwner && !isGlobalAndAdmin) {
      console.log('Authorization failed for template update');
      return res.status(403).json({ message: 'Not authorized to update this template' });
    }
    
    // Update fields
    template.name = req.body.name;
    template.description = req.body.description;
    template.exercises = req.body.exercises;
    
    // If admin is converting a personal template to global
    if (req.body.isGlobal === true && req.user.isAdmin) {
      console.log('Converting template to global');
      template.userId = null;
    }
    // If admin is converting a global template to personal
    else if (req.body.isGlobal === false && template.userId === null && req.user.isAdmin) {
      console.log('Converting global template to personal');
      template.userId = req.user.id;
    }
    
    const updatedTemplate = await template.save();
    console.log('Template updated successfully');
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a workout template (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Check if user is authorized to delete this template
    // Allow if: 1) User owns the template, or 2) Template is global and user is admin
    const isOwner = template.userId && template.userId.toString() === req.user.id.toString();
    const isGlobalAndAdmin = template.userId === null && req.user.isAdmin;
    
    if (!isOwner && !isGlobalAndAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this template' });
    }
    
    template.isDeleted = true;
    template.deletedAt = new Date();
    
    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hard delete a workout template
router.delete('/:id/permanent', protect, async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Check if user is authorized to permanently delete this template
    // Allow if: 1) User owns the template, or 2) Template is global and user is admin
    const isOwner = template.userId && template.userId.toString() === req.user.id.toString();
    const isGlobalAndAdmin = template.userId === null && req.user.isAdmin;
    
    if (!isOwner && !isGlobalAndAdmin) {
      return res.status(403).json({ message: 'Not authorized to permanently delete this template' });
    }
    
    await WorkoutTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout template permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore a deleted workout template
router.patch('/:id/restore', protect, async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    // Check if user is authorized to restore this template
    // Allow if: 1) User owns the template, or 2) Template is global and user is admin
    const isOwner = template.userId && template.userId.toString() === req.user.id.toString();
    const isGlobalAndAdmin = template.userId === null && req.user.isAdmin;
    
    if (!isOwner && !isGlobalAndAdmin) {
      return res.status(403).json({ message: 'Not authorized to restore this template' });
    }
    
    template.isDeleted = false;
    template.deletedAt = null;
    
    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import workout templates
router.post('/import', protect, async (req, res) => {
  try {
    const { templates } = req.body;
    
    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({ message: 'No templates provided for import' });
    }
    
    // Add userId to each template
    const templatesWithUserId = templates.map(template => {
      // If user is admin and template is marked as global, set userId to null
      const isGlobal = template.isGlobal === true && req.user.isAdmin;
      return {
        ...template,
        userId: isGlobal ? null : req.user.id
      };
    });
    
    const importedTemplates = await WorkoutTemplate.insertMany(templatesWithUserId);
    res.status(201).json(importedTemplates);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
