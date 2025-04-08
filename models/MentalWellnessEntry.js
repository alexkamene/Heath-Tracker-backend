// models/MentalWellnessEntry.js
const mongoose = require('mongoose');

const mentalWellnessEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mood: {
    type: Number, // 1-10 scale (1: Very Poor, 10: Excellent)
    required: true,
    min: 1,
    max: 10
  },
  stressLevel: {
    type: Number, // 1-10 scale (1: Very Low, 10: Very High)
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String, // Optional field for additional reflections
    default: ''
  }
}, { timestamps: true });

const MentalWellnessEntry = mongoose.model('MentalWellnessEntry', mentalWellnessEntrySchema);

module.exports = MentalWellnessEntry;
