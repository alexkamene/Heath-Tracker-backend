const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badgeName: { type: String, required: true },
  description: { type: String, required: true },
  awardedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Badge", badgeSchema);