const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  medicalConditions: [{ type: String }], // List of diseases
  profilePic: { type: String, default: "https://via.placeholder.com/150" },
  xp: { type: Number, default: 0 }, // 🎮 Experience Points
  level: { type: Number, default: 1 }, // 🔥 Level System
  streak: { type: Number, default: 0 }, // 🔥 Consecutive Days Active
  lastActive: { type: Date }, // 📅 Track Last Activity
  badges: [{ title: String, description: String, dateEarned: Date }], 
  twoFactorSecret: { type: String,default: null }, // Secret for TOTP
  twoFactorEnabled: { type: Boolean, default: false }, // Whether 2FA is active
});

module.exports = mongoose.model("User", UserSchema);
