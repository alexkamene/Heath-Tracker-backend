const mongoose = require("mongoose");
const exerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    duration: Number, // in minutes
    caloriesBurned: Number,
    date: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Exercise', exerciseSchema);
  