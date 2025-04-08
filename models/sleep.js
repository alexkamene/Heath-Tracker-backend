// models/SleepEntry.js
const mongoose = require('mongoose');

const sleepEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  sleepTime: { type: String, required: true },
  wakeTime: { type: String, required: true },
  duration: { type: Number }, // in hours
});

module.exports = mongoose.model('SleepEntry', sleepEntrySchema);
