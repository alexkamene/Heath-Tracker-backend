const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['steps', 'calories'], default: 'calories' },
  target: { type: Number, required: true },
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'weekly' }, // 👈 added
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
