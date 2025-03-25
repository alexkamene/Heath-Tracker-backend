const mongoose = require("mongoose");

const HealthDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // ✅ Wellness Data
  sleepHours: { type: Number, default: 0 },
  deepSleepHours: { type: Number, default: 0 }, // ✅ Unique
  hydrationLevel: { type: Number, default: 0 }, // ✅ Unique
  moodScore: { type: Number, default: 5 }, // 1-10 scale ✅ Unique
  screenTime: { type: Number, default: 0 }, // ✅ Unique
  mentalFocus: { type: Number, default: 0 }, // ✅ Unique
  recoveryIndex: { type: Number, default: 0 }, // ✅ Unique

  loggedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HealthData", HealthDataSchema);
