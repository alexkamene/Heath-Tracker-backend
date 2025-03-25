const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalPoints: { type: Number, default: 0 },
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);