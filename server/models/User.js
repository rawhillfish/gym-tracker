const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#1976d2' // Default MUI primary color
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
userSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('User', userSchema);
