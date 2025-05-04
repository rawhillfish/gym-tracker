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
    exerciseId: {
      type: String,
      required: true
    },
    _id: {
      type: mongoose.Schema.Types.Mixed, 
      required: false 
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
  // Soft deletion fields
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutTemplate', WorkoutTemplateSchema);
