const mongoose = require("mongoose");

const HealthReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true }, // Example: "Drink Water"
  description: { type: String }, // Optional details
  date: { type: Date, required: true }, // Scheduled date & time
  reminderType: { type: String, enum: ["Workout", "Hydration", "Sleep", "Medication"], required: true },
  completed: { type: Boolean, default: false }, // Mark if completed
});

module.exports = mongoose.model("HealthReminder", HealthReminderSchema);
