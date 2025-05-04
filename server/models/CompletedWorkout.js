const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
  weight: Number,
  reps: Number,
  completed: Boolean
});

const ExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  },
  name: String,
  sets: [SetSchema]
});

const WorkoutSchema = new mongoose.Schema({
  templateName: String,
  startTime: Date,
  endTime: Date,
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

module.exports = mongoose.model('CompletedWorkout', WorkoutSchema);
