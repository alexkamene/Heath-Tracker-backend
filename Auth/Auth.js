
const router=require('express').Router();
const User=require('../models/User');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const HealthData =require('../models/heath');
const SecurityLog =require('../models/securitylogs');
const Notification =require('../models/Notification');
const Gamification =require('../models/gamification');
const cron =require('node-cron');
const UserActivityLog =require('../models/UserActivityLog');
const axios =require('axios');
const useragent =require('useragent');
const heathd=require('../models/healthd');
const healthd = require('../models/healthd');
const crypto = require("crypto");
const nodemailer=require("nodemailer")
const Leaderboard = require("../models/Leaderboard");
const Badge = require("../models/Badges");
const HealthJournal = require("../models/HealthJournal");
const Challenge = require("../models/Challenges");

const HealthReminder = require("../models/healthrReminder.js");
// Authentication Middleware
const verifyToken = (req, res, next) => {
  try {
      // Extract token from the Authorization header
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
          return res.status(400).send("You don't have a token");
      }

      // Verify the token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
              console.error('Token verification failed:'); // Log the error
              return res.sendStatus(403); // Forbidden
          }

          // Set user ID from the token
          req.userId = decoded._id;
          req.user = decoded; // Set the user object


          
          next(); // Call the next middleware or route handler
      });

  } catch (error) {
      console.error('Error occurred in verifyToken middleware:', error); // Log the error
      return res.status(500).send("An error occurred"); // Internal server error
  }
};
const verifyAdmin = async (req, res, next) => {
  // First, verify the token
  await verifyToken(req, res, async () => {
      // After verifying the token, check the user's role
      const user = await User.findById(req.userId); // Fetch user based on userId set by verifyToken

      console.log(user)
      if (!user || user.role !== 'Admin') {
          return res.status(403).send('Access denied: You are not an organizer'); // Forbidden
      }
      next(); // Proceed to the next middleware if the user is an organizer
  });
}
  

// ✅ REGISTER A USER
router.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, ip } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User with that email already exists" });

    const checkUsername = await User.findOne({ username });
    if (checkUsername) return res.status(401).json({ message: "Try another username" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Log registration in security logs
    await SecurityLog.create({
      userId: newUser._id,
      action: "User Registration",
      status: "Success",
      ip_address: ip || "Unknown",
    });

    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred while processing your request" });
  }
});


// ✅ LOGIN A USER with Debugging Fixes
router.post("/api/login", async (req, res) => {
  try {
    const { email, password, ip } = req.body;

    
    if (!ip) return res.status(400).json({ error: "IP address is required" });

    const user = await User.findOne({ email });
    if (!user) {
      await SecurityLog.create({ action: "Login Attempt", status: "Failed", ip_address: ip });
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await SecurityLog.create({ userId: user._id, action: "Login Attempt", status: "Failed", ip_address: ip });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Fetch Geo-Location with Error Handling
    let locationData = { city: "Unknown", country: "Unknown" };
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      if (response.data.status === "success") {
        locationData = { city: response.data.city, country: response.data.country };
      }
    } catch (error) {
      console.error("❌ Failed to fetch location. Skipping:", error.message);
    }

    // ✅ Get Device & Browser Info Safely
    const agent = useragent.parse(req.headers["user-agent"] || "Unknown Device");
    const deviceInfo = `${agent.os.family} (${agent.device.family}) - ${agent.toAgent()}`;

    // ✅ Generate JWT Token
    const token = jwt.sign({ _id: user._id, username:user.username }, process.env.JWT_SECRET);

    // ✅ Log Successful Login
    await SecurityLog.create({
      userId: user._id,
      action: "Login Attempt",
      status: "Success",
      ip_address: ip,
      location: `${locationData.city}, ${locationData.country}`,
      device: deviceInfo,
    });

    res.json({ token, role: user.role, userId: user._id, username: user.username });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//add heath data
router.post("/api/healthdata", verifyToken, async (req, res) => {
  try {
    const healthEntry = new HealthData({ userId: req.userId, ...req.body });
    const savedEntry = await healthEntry.save();
    
    res.status(201).json({ message: "Health Data Added Successfully", data: savedEntry }); 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Log Health Data
router.post("/healthdata", verifyToken, async (req, res) => {
  try {
    const { weight, height, steps, sleepHours, heartRate, mentalHealthScore,workouts, caloriesBurned, activityType } = req.body;

    const newHealthData = new heathd({
      userId: req.userId,
      weight,
      height,
      steps,
      sleepHours,
      heartRate,
      mentalHealthScore,
      workouts,
      caloriesBurned,
      activityType,
    });

    await newHealthData.save();
    res.status(201).json({ message: "Health data logged successfully", data: newHealthData });
  } catch (error) {
    console.error("❌ Error Logging Health Data:", error);
    res.status(500).json({ error: "Failed to log health data" });
  }
});

// ✅ Fetch Logged Health Data
router.get("/healthdata", verifyToken, async (req, res) => {
  try {
    const healthData = await heathd.find({ userId: req.userId }).sort({ loggedAt: -1 });
    res.json(healthData);
  } catch (error) {
    console.error("❌ Error Fetching Health Data:", error);
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});



//get all health data
router.get("/api/healthdata", verifyToken, async (req, res) => {
  try {
    const healthData = await HealthData.find({ userId: req.userId });
    res.json(healthData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
);

router.post("/log/wellness", verifyToken, async (req, res) => {
  try {
    const { sleepHours, hydrationLevel, moodScore, screenTime, mentalFocus, recoveryIndex } = req.body;

    const newEntry = new HealthData({
      userId: req.userId,
      sleepHours,
      hydrationLevel,
      moodScore,
      screenTime,
      mentalFocus,
      recoveryIndex,
      loggedAt: new Date(),
    });

    await newEntry.save();
    res.status(201).json({ message: "✅ Wellness data logged successfully!", data: newEntry });
  } catch (error) {
    console.error("❌ Error Logging Wellness Data:", error);
    res.status(500).json({ error: "Failed to log wellness data" });
  }
});


//get a single health data
router.get("/api/healthdata/:id", verifyToken, async (req, res) => {
  try {
    const healthData = await HealthData.findById(req.params.id);
    res.json(healthData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
);


//update health data
router.put("/api/healthdata/:id", verifyToken, async (req, res) => {
  try {
    const updatedData = await HealthData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
);

//delete health data
router.delete("/api/healthdata/:id", verifyToken, async (req, res) => {
  try {
    await healthd.findByIdAndDelete(req.params.id);
    res.json({ message: "Health Data Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}
);

// GET: Fetch all security logs for the logged-in user
router.get("/securitylogs", verifyToken, async (req, res) => {
  try {
    const logs = await SecurityLog.find({ userId: req.userId}).sort({ timestamp: -1 });
    
    console.log("securty log")
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get All Security Logs for a User
router.get('/:userId', async (req, res) => {
  try {
    const logs = await SecurityLog.find({ user_id: req.params.userId }).sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ POST: Log a security event
router.post("/securitylogs", verifyToken, async (req, res) => {
  try {
    const { action, status, ip_address } = req.body;
    const newLog = new SecurityLog({ userId: req.userId, action, status, ip_address });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Log User Activity (Every Page Visit)
router.post("/api/useractivity", verifyToken, async (req, res) => {
  try {
    const { pageVisited, ip } = req.body;

    console.log("📌 Logging Activity:", { userId: req.userId, pageVisited, ip });

    await UserActivityLog.create({
      userId: req.userId,
      pageVisited,
      ip_address: ip,
    });

    res.status(201).json({ message: "User activity logged successfully" });
  } catch (error) {
    console.error("❌ Error Logging Activity:", error);
    res.status(500).json({ error: "Failed to log user activity" });
  }
});
// ✅Fetch user activity logs

router.get("/fetchuserlogs", verifyToken, async (req, res) => {
  try {
      const logs = await UserActivityLog.find({ userId: req.userId }).sort({ timestamp: -1 });
     
     
     
      res.json(logs);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch user activity logs" });
  }
}
);


router.get("/api/healthinsights", verifyToken, async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    // Convert to Date objects (default to broad range if not provided)
    startDate = startDate ? new Date(startDate) : new Date("2000-01-01");
    endDate = endDate ? new Date(endDate) : new Date();

    // Fetch health data for the user within the date range
    const healthData = await heathd.find({
      userId: req.userId,
      loggedAt: { $gte: startDate, $lte: endDate },
    }).sort({ loggedAt: -1 });

    if (healthData.length < 2) {
      return res.json({ message: "Not enough data to generate insights." });
    }

    // Compute Insights
    const totalSteps = healthData.reduce((sum, entry) => sum + (entry.steps || 0), 0);
    const avgSleep = healthData.reduce((sum, entry) => sum + (entry.sleepHours || 0), 0) / healthData.length;
    const avgHeartRate = healthData.reduce((sum, entry) => sum + (entry.heartRate || 0), 0) / healthData.length;

    let recommendation = "Keep up the great work!";
    if (avgSleep < 6) {
      recommendation = "Consider improving your sleep habits. Aim for at least 7 hours.";
    } else if (totalSteps < 50000) {
      recommendation = "Try increasing your daily steps to boost cardiovascular health.";
    } else if (avgHeartRate > 90) {
      recommendation = "Monitor your heart rate. Consider reducing stress or increasing cardio exercises.";
    }

    // ✅ Save Notification with `type`
    try {
      await Notification.create({
        userId: req.userId,
        type: "Health Insight", // ✅ Ensure this field is included
        message: `New AI Insight: ${recommendation}`,
      });
    } catch (notifError) {
      console.error("❌ Failed to save notification:", notifError.message);
    }

    res.json({
      totalSteps,
      avgSleep: avgSleep.toFixed(1),
      avgHeartRate: avgHeartRate.toFixed(1),
      recommendation,
    });

  } catch (error) {
    console.error("❌ Error generating health insights:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});



// Fetch Notifications
router.get("/api/notifications", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});
// ✅ Mark Notifications as Read
router.post("/api/notifications/mark-as-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { $set: { read: true } });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("❌ Error updating notifications:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Mark Notification as Read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { status: "Read" }, { new: true });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//get user profile
router.get('/user/profile',verifyToken, async (req, res) => {
  try {
      const user = await User.findById(req.userId);
      if (!user) {
          return res.status(404).send({ message: 'User not found' });
      }

      return res.status(200).send(user);
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Server error', error: error.message });
  }




});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // From verifyToken middleware
    const updatedData = req.body;

    // Update the user in the database
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    console.log('Updated user:', user); // Debug log
    return res.status(200).send(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).send({ message: 'Server error', error: error.message });
  }
});

// ✅ Change Password
router.put("/changepassword", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Step 1: Request password reset
router.post("/forgotpassword", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store hashed token and expiration in database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();
    // Send reset link via email
    const resetUrl = `http://localhost:3000/resetpassword?token=${resetToken}&email=${email}`;

    // Configure email transport
    const transporter = nodemailer.createTransport({
      secure:true,
      port:465,
    host:"smtp.gmail.com",

      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your password
      },
    });
    gg
   // Send Emailh
   await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click the link below to reset:</p>
           <a href="${resetUrl}" target="_blank">${resetUrl}</a>
           <p>This link expires in 1 hour.</p>`,
  });

  res.json({ message: "Password reset link sent to email" });
} catch (error) {
  console.error("Error sending reset email:", error);
  res.status(500).json({ error: "Failed to send password reset email" });
}
});

// Step 2: Reset Password
router.post("/resetpassword", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if token is valid and not expired
    if (!user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Verify token
    const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isMatch) return res.status(400).json({ error: "Invalid reset token" });

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

router.get("/totalsteps", verifyToken, async (req, res) => {
  try {
    const totalSteps = await healthd.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, totalSteps: { $sum: "$steps" } } },
    ]);

    res.json({ totalSteps: totalSteps.length ? totalSteps[0].totalSteps : 0 });
  } catch (error) {
    console.error("❌ Error fetching total steps:", error);
    res.status(500).json({ error: "Failed to fetch total steps" });
  }
});

// ✅ Log Activity & Award XP
router.post("/logactivity", verifyToken, async (req, res) => {
  try {
    const { activityType, duration } = req.body;
    const user = await User.findById(req.userId);
    
    // 🎮 Calculate XP based on activity
    const xpEarned = Math.floor(duration / 10); 
    user.xp += xpEarned;

    // 🔥 Level Up System (every 100 XP = +1 Level)
    if (user.xp >= user.level * 100) {
      user.level += 1;
    }

    // 🔥 Streak System (If active yesterday, increase streak)
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (user.lastActive && user.lastActive.toDateString() === yesterday.toDateString()) {
      user.streak += 1;
    } else {
      user.streak = 1; // Reset streak if missed a day
    }
    
    user.lastActive = today;
    await user.save();

    res.json({ message: "Activity logged!", xpEarned, level: user.level, streak: user.streak });
  } catch (error) {
    res.status(500).json({ error: "Failed to log activity" });
  }
});

const checkForBadges = async (userId) => {
  const user = await User.findById(userId);
  
  const badgeList = [
    { name: "First Steps", condition: user.xp >= 10 },
    { name: "Health Champion", condition: user.xp >= 500 },
    { name: "Workout Warrior", condition: user.streak >= 7 },
  ];

  for (let badge of badgeList) {
    const existingBadge = await Badge.findOne({ userId, title: badge.name });
    if (badge.condition && !existingBadge) {
      await Badge.create({ userId, title: badge.name, description: `Earned for ${badge.name}` });
    }
  }
};
router.get("/user/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find().sort({ xp: -1 }).limit(10).select("username xp level");
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});
router.get("/user/badges", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const healthData = await heathd.find({ userId: req.userId }).sort({ loggedAt: -1 });

    let badges = [...user.badges]; // ✅ Keep existing badges

    const totalSteps = healthData.reduce((sum, entry) => sum + entry.steps, 0);
    const totalWorkouts = healthData.reduce((sum, entry) => sum + entry.workouts, 0);
    const totalSleep = healthData.reduce((sum, entry) => sum + entry.sleepHours, 0);

    const newBadges = [];

    if (totalSteps >= 10000 && !badges.some(b => b.title === "Step Master")) {
      newBadges.push({ title: "Step Master", description: "Walked 10,000+ steps!", dateEarned: new Date() });
    }
    if (totalWorkouts >= 20 && !badges.some(b => b.title === "Fitness Champion")) {
      newBadges.push({ title: "Fitness Champion", description: "Completed 20 workouts!", dateEarned: new Date() });
    }
    if (totalSleep >= 40 && !badges.some(b => b.title === "Sleep Guru")) {
      newBadges.push({ title: "Sleep Guru", description: "Slept 8+ hours for 5 days!", dateEarned: new Date() });
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges); // ✅ Append new badges
      await user.save(); // ✅ Save updated user data
    }

    res.json({ badges: user.badges });
  } catch (error) {
    console.error("❌ Error updating badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

router.get("/user/xp", verifyToken, async (req, res) => {
  try {
    const healthData = await heathd.find({ userId: req.userId }).sort({ loggedAt: -1 });

    if (!healthData.length) {
      return res.status(404).json({ message: "No health data found" });
    }

    let totalXP = 0;

    healthData.forEach((entry) => {
      totalXP += Math.floor(entry.steps / 100); // 1 XP per 100 steps
      totalXP += Math.floor(entry.workouts / 30) * 10; // 10 XP per 30 min
      totalXP += Math.min(entry.sleepHours, 8) * 5; // Max 8 hours for XP
    });

    const user = await User.findById(req.userId);
    user.xp = totalXP;

    // Check for level-up
    while (user.xp >= user.level * 100) {
      user.level += 1;
    }

    // streak system
    await user.save();

    res.json({ xp: totalXP, level: user.level, lastEntry: healthData[0] });
  } catch (error) {
    console.error("❌ Error calculating XP:", error);
    res.status(500).json({ error: "Failed to calculate XP" });
  }
});


// ✅ Save a new journal entry
router.post("/api/journal", verifyToken, async (req, res) => {
  try {
    const { entry } = req.body;

    const newJournalEntry = new HealthJournal({
      userId: req.userId,
      entry,
      date: new Date(),
    });

    await newJournalEntry.save();
    res.status(201).json({ message: "Journal entry saved!", data: newJournalEntry });
  } catch (error) {
    res.status(500).json({ error: "Failed to save journal entry" });
  }
});

// ✅ Get all journal entries for the user
router.get("/api/journal", verifyToken, async (req, res) => {
  try {
    const entries = await HealthJournal.find({ userId: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

// ✅ Delete a journal entry
router.delete("/api/journal/:entryId", verifyToken, async (req, res) => {
  try {
    await HealthJournal.findOneAndDelete({ _id: req.params.entryId, userId: req.userId });
    res.json({ message: "Journal entry deleted!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete journal entry" });
  }
});
// calendars and reminders


// ✅ Create a new health reminder
router.post("/reminder", verifyToken, async (req, res) => {
  try {
    const { title, description, date, reminderType } = req.body;
    const newReminder = new HealthReminder({ userId: req.userId, title, description, date, reminderType });
    await newReminder.save();
    res.status(201).json({ message: "Reminder added successfully!" });

  } catch (error) {
    res.status(500).json({ error: "Failed to add reminder" });
  }
});

// ✅ Fetch all reminders for the logged-in user
router.get("/api/reminders", verifyToken, async (req, res) => {
  try {
    const reminders = await HealthReminder.find({ userId: req.userId }).sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

// ✅ Mark a reminder as completed
router.put("/reminder/:id/complete", verifyToken, async (req, res) => {
  try {
    const reminder = await HealthReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });

    reminder.completed = true;
    await reminder.save();
    res.json({ message: "Reminder marked as completed!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

// ✅ Delete a reminder
router.delete("/reminder/:id", verifyToken, async (req, res) => {
  try {
    await HealthReminder.findByIdAndDelete(req.params.id);
    res.json({ message: "Reminder deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});


module.exports=router;