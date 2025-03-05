const mongoose = require('mongoose');

const WorkoutTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  exercises: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    name: String,
    category: String,
    sets: {
      type: Number,
      default: 3
    },
    reps: {
      type: Number,
      default: 8
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkoutTemplate', WorkoutTemplateSchema);
