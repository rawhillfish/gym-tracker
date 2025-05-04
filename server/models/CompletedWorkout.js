const mongoose = require('mongoose');
const WorkoutTemplate = require('./WorkoutTemplate');
const Exercise = require('./Exercise');

const SetSchema = new mongoose.Schema({
  weight: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
});

const ExerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  name: { type: String, required: true },
  sets: [SetSchema]
});

const completedWorkoutSchema = new mongoose.Schema({
  templateId: { type: String, required: true },
  templateName: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: Date.now },
  exercises: [ExerciseSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'completedworkouts'
});

// Helper function to find template ID by name
const findTemplateIdByName = async (templateName) => {
  try {
    const template = await WorkoutTemplate.findOne({ name: templateName });
    if (template && template._id) {
      console.log(`Found template ID for ${templateName}: ${template._id}`);
      return template._id.toString();
    }
    console.log(`No template found with name: ${templateName}`);
    return null;
  } catch (error) {
    console.error(`Error finding template ID for ${templateName}:`, error);
    return null;
  }
};

// Helper function to find exercise ID by name
const findExerciseIdByName = async (exerciseName) => {
  try {
    const exercise = await Exercise.findOne({ name: exerciseName });
    if (exercise && exercise._id) {
      console.log(`Found exercise ID for ${exerciseName}: ${exercise._id}`);
      return exercise._id.toString();
    }
    console.log(`No exercise found with name: ${exerciseName}`);
    return null;
  } catch (error) {
    console.error(`Error finding exercise ID for ${exerciseName}:`, error);
    return null;
  }
};

// Pre-save hook to ensure templateId is preserved
completedWorkoutSchema.pre('save', async function (next) {
  console.log('CompletedWorkout pre-save hook triggered');
  
  // Log the original template ID for debugging
  console.log(`Original templateId: ${this.templateId || 'none'}`);
  console.log(`Original templateName: ${this.templateName || 'none'}`);
  
  // Ensure templateId is preserved if it exists
  if (!this.templateId) {
    // Try to find the template ID by name
    const templateId = await findTemplateIdByName(this.templateName);
    if (templateId) {
      this.templateId = templateId;
      console.log(`Setting templateId for ${this.templateName}: ${templateId}`);
    }
  }
  
  // Process exercises to ensure exerciseId is preserved
  if (this.exercises && Array.isArray(this.exercises)) {
    for (const exercise of this.exercises) {
      console.log(`Processing exercise: ${exercise.name}`);
      console.log(`Original exerciseId: ${exercise.exerciseId || 'none'}`);
      console.log(`Original id: ${exercise.id || 'none'}`);
      
      // Preserve exerciseId if it exists, otherwise use id
      if (!exercise.exerciseId && exercise.id) {
        exercise.exerciseId = exercise.id;
        console.log(`Setting exerciseId from id: ${exercise.exerciseId}`);
      }
      
      // If still no exerciseId, try to find it by name
      if (!exercise.exerciseId) {
        const exerciseId = await findExerciseIdByName(exercise.name);
        if (exerciseId) {
          exercise.exerciseId = exerciseId;
          console.log(`Setting exerciseId for ${exercise.name}: ${exerciseId}`);
        }
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('CompletedWorkout', completedWorkoutSchema);
