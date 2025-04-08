// models/MealEntry.js
const mongoose = require('mongoose');

const MealEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snacks'], required: true },
  foodName: String,
  calories: Number,
  quantity: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MealEntry', MealEntrySchema);
