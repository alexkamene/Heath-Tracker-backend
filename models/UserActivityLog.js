const mongoose = require("mongoose");

const UserActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pageVisited: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip_address: { type: String },
});

module.exports = mongoose.model("UserActivityLog", UserActivityLogSchema);
