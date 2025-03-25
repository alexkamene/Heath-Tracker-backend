const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  challengeText: String,
  rewardPoints: Number,
  status: { type: String, enum: ["Open", "In Progress", "Completed"], default: "Open" },
  participants: [{ userId: mongoose.Schema.Types.ObjectId, progress: Number, completed: Boolean }],
  milestone: { type: Number, required: true }, // ✅ User-defined milestone (e.g., 150 hours)
  unit: { type: String, enum: ["hours", "steps", "workouts"], required: true }, // ✅ Milestone unit
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
