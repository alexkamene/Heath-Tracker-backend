// models/WaterEntry.js
const mongoose = require('mongoose');

const waterEntrySchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0 // Ensure non-negative values
  }
}, { timestamps: true });

const WaterEntry = mongoose.model('WaterEntry', waterEntrySchema);

module.exports = WaterEntry;
