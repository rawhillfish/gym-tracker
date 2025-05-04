const express = require('express');
const router = express.Router();
const CompletedWorkout = require('../models/CompletedWorkout');
const User = require('../models/User');

// Get all workouts
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { user: userId } : {};
    const workouts = await CompletedWorkout.find(query)
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
    console.log('Received completed workout request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Log important fields for debugging
    console.log(`Template ID from request: ${req.body.templateId || 'none'}`);
    console.log(`Template Name from request: ${req.body.templateName || 'none'}`);
    
    // If templateId is missing, try to find it by name
    if (!req.body.templateId && req.body.templateName) {
      try {
        const WorkoutTemplate = require('../models/WorkoutTemplate');
        const template = await WorkoutTemplate.findOne({ name: req.body.templateName });
        if (template && template._id) {
          req.body.templateId = template._id.toString();
          console.log(`Found and set templateId for ${req.body.templateName}: ${req.body.templateId}`);
        }
      } catch (error) {
        console.error(`Error finding template ID for ${req.body.templateName}:`, error);
      }
    }
    
    // Log exercises for debugging
    if (req.body.exercises && Array.isArray(req.body.exercises)) {
      console.log(`Number of exercises in request: ${req.body.exercises.length}`);
      
      // Process each exercise to ensure exerciseId is set
      for (const exercise of req.body.exercises) {
        console.log(`Exercise: ${exercise.name}`);
        console.log(`  Exercise ID: ${exercise.exerciseId || exercise.id || 'none'}`);
        console.log(`  Sets: ${exercise.sets ? exercise.sets.length : 0}`);
        
        // Ensure exerciseId is set
        if (!exercise.exerciseId && exercise.id) {
          exercise.exerciseId = exercise.id;
          console.log(`  Setting exerciseId from id: ${exercise.exerciseId}`);
        }
        
        // If still no exerciseId, try to find it by name
        if (!exercise.exerciseId) {
          try {
            const Exercise = require('../models/Exercise');
            const exerciseDoc = await Exercise.findOne({ name: exercise.name });
            if (exerciseDoc && exerciseDoc._id) {
              exercise.exerciseId = exerciseDoc._id.toString();
              console.log(`  Found and set exerciseId for ${exercise.name}: ${exercise.exerciseId}`);
            }
          } catch (error) {
            console.error(`  Error finding exercise ID for ${exercise.name}:`, error);
          }
        }
        
        // Log sets for debugging
        if (exercise.sets && Array.isArray(exercise.sets)) {
          exercise.sets.forEach((set, setIndex) => {
            console.log(`    Set ${setIndex + 1}: Weight: ${set.weight}, Reps: ${set.reps}, Completed: ${set.completed}`);
          });
        }
      }
    }
    
    // Validate required fields
    if (!req.body.exercises || !Array.isArray(req.body.exercises)) {
      throw new Error('Exercises array is required');
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const completedWorkout = new CompletedWorkout({
      templateId: req.body.templateId,
      templateName: req.body.templateName,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      exercises: req.body.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: exercise.sets
      })),
      user: user._id
    });

    console.log('Created workout document:', JSON.stringify({
      templateId: completedWorkout.templateId,
      templateName: completedWorkout.templateName,
      exercises: completedWorkout.exercises.map(ex => ({
        name: ex.name,
        exerciseId: ex.exerciseId
      }))
    }, null, 2));
    
    await completedWorkout.save();
    
    console.log('Completed workout saved successfully');
    console.log(`Saved templateId: ${completedWorkout.templateId}`);
    
    const populatedWorkout = await CompletedWorkout.findById(completedWorkout._id).populate('user', 'name color');
    res.status(201).json(populatedWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(400).json({ message: error.message });
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
    
    const workout = await CompletedWorkout.findByIdAndUpdate(
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
    const workout = await CompletedWorkout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fix all workout and exercise IDs
router.post('/fix-ids', async (req, res) => {
  try {
    console.log('Starting to fix workout and exercise IDs');
    
    // Get all workouts
    const workouts = await CompletedWorkout.find({});
    console.log(`Found ${workouts.length} workouts to check`);
    
    // Get all workout templates for matching
    const WorkoutTemplate = require('../models/WorkoutTemplate');
    const templates = await WorkoutTemplate.find({});
    console.log(`Found ${templates.length} workout templates for matching`);
    
    // Get all exercises for matching
    const Exercise = require('../models/Exercise');
    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises for matching`);
    
    // Create a map of exercise names to IDs
    const exerciseMap = {};
    exercises.forEach(ex => {
      exerciseMap[ex.name.toLowerCase()] = ex._id.toString();
    });
    
    let updatedWorkoutCount = 0;
    let updatedExerciseCount = 0;
    
    // Process each workout
    for (const workout of workouts) {
      let workoutUpdated = false;
      
      // Add templateId if missing
      if (!workout.templateId && workout.templateName) {
        const matchingTemplate = templates.find(t => 
          t.name && workout.templateName && 
          t.name.toLowerCase() === workout.templateName.toLowerCase()
        );
        
        if (matchingTemplate) {
          workout.templateId = matchingTemplate._id.toString();
          console.log(`Updated workout ${workout._id} with templateId ${matchingTemplate._id}`);
          workoutUpdated = true;
        } else {
          workout.templateId = 'legacy-template';
          console.log(`Set default templateId for workout ${workout._id}`);
          workoutUpdated = true;
        }
      }
      
      // Update exercises
      if (workout.exercises && Array.isArray(workout.exercises)) {
        for (const exercise of workout.exercises) {
          if (!exercise.exerciseId && exercise.name) {
            const matchingExercise = exercises.find(ex => 
              ex.name.toLowerCase() === exercise.name.toLowerCase()
            );
            
            if (matchingExercise) {
              exercise.exerciseId = matchingExercise._id.toString();
              console.log(`Updated exercise ${exercise.name} with exerciseId ${matchingExercise._id}`);
              updatedExerciseCount++;
              workoutUpdated = true;
            } else {
              // Create a fallback ID based on the name
              exercise.exerciseId = `legacy-exercise-${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              console.log(`Set default exerciseId for ${exercise.name}`);
              updatedExerciseCount++;
              workoutUpdated = true;
            }
          }
        }
      }
      
      // Save if updated
      if (workoutUpdated) {
        await workout.save();
        updatedWorkoutCount++;
      }
    }
    
    console.log(`Fixed ${updatedWorkoutCount} workouts and ${updatedExerciseCount} exercises`);
    res.json({ 
      message: `Fixed ${updatedWorkoutCount} workouts and ${updatedExerciseCount} exercises`,
      updatedWorkouts: updatedWorkoutCount,
      updatedExercises: updatedExerciseCount
    });
  } catch (error) {
    console.error('Error fixing workout and exercise IDs:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
