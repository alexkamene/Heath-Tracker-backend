const mongoose = require("mongoose");

const GamificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalSteps: { type: Number, default: 0 },
  badges: [{ type: String }], // List of earned badges
  streak: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: null },
  leaderboardPoints: { type: Number, default: 0 },
  weeklyChallenge: {
    opponentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Friend they challenged
    steps: { type: Number, default: 0 }, // Steps this week
    completed: { type: Boolean, default: false }, // Did they complete the challenge?
  },
  lastReset: { type: Date, default: new Date() }, // Tracks weekly reset
});

module.exports = mongoose.model("Gamification", GamificationSchema);
