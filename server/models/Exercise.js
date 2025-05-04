const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  defaultReps: {
    type: Number,
    default: 8
  },
  category: {
    type: String,
    enum: ['Arms', 'Back', 'Chest', 'Core', 'Legs (Calves)', 'Legs (Glutes)', 'Legs (Hamstring)', 'Legs (Quads)', 'Shoulders', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
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

// Add an index to improve query performance when filtering deleted items
ExerciseSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);
