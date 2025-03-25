const mongoose = require("mongoose");

const HealthDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weight: { type: Number, required: true }, // kg
  height: { type: Number }, // cm
  steps: { type: Number, default: 0 }, // Daily steps
  sleepHours: { type: Number, default: 0 }, // Hours slept
  heartRate: { type: Number }, // BPM
  mentalHealthScore: { type: Number, min: 1, max: 10 }, // 1-10 scale
  caloriesBurned: { type: Number }, // kcal
  workouts:{type:Number},
  activityType: { type: String, enum: ["Walking", "Running", "Cycling", "Other"] },
  loggedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("heathd", HealthDataSchema);
