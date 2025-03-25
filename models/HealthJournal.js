const mongoose = require("mongoose");

const HealthJournalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  entry: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HealthJournal", HealthJournalSchema);
