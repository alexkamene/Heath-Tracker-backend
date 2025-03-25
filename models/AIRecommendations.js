
const mongoose = require('mongoose');

const AIRecommendationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recommendation_text: String,
    generated_at: { type: Date, default: Date.now },
    status: { type: String, default: "unread" }
  });
  
module.exports = mongoose.model('AIRecommendation', AIRecommendationSchema);  