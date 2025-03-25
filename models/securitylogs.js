
const mongoose = require('mongoose');
const SecurityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // e.g., "Login Attempt"
  status: { type: String, enum: ["Success", "Failed"], required: true },
  ip_address: { type: String, required: true },
  location: { type: String, default: "Unknown" }, // Stores City & Country
  device: { type: String, default: "Unknown" }, // Stores Device & Browser Info
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);