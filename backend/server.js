const dns = require('dns');
dns.setServers(['8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const StudyLog = require('./models/StudyLog');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("Error: MONGODB_URI is not defined in .env file.");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB successfully!"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Simple GET /api/health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: "success",
        message: "FocusFuel backend is running!",
        timestamp: new Date()
    });
});

// POST /api/logs - Calculate metrics and save new log
app.post('/api/logs', async (req, res) => {
    const { study, sleep, breaks, stress } = req.body;

    // Validation (allow 0 as a valid number, check for negative and numeric type)
    const isValid = (val) => typeof val === 'number' && !isNaN(val) && val >= 0;

    if (!isValid(study) || !isValid(sleep) || !isValid(breaks) || !isValid(stress)) {
        return res.status(400).json({
            error: "Validation failed. Study, sleep, breaks, and stress must be non-negative numbers."
        });
    }

    // BURNOUT LOGIC
    let burnout = "";
    if (sleep < 5 && stress > 7 && study > 6) {
        burnout = "High";
    } else if (sleep < 6 || stress > 6 || study > 8) {
        burnout = "Moderate";
    } else {
        burnout = "Low";
    }

    // PRODUCTIVITY SCORE (rounded to nearest whole number, clamped 0 - 100)
    let productivity = Math.round(
        (sleep * 12) + (study * 8) + (breaks * 4) - (stress * 10)
    );
    if (productivity < 0) productivity = 0;
    if (productivity > 100) productivity = 100;

    // RECOMMENDATIONS
    let recommendation = "";
    if (burnout === "High") {
        recommendation = "High burnout detected. Reduce study load and prioritize sleep immediately.";
    } else if (burnout === "Moderate") {
        recommendation = "You're slightly imbalanced. Improve sleep and take more structured breaks.";
    } else {
        recommendation = "Great balance! Keep maintaining your current routine.";
    }

    // SAVE LOG
    try {
        const logEntry = new StudyLog({
            study,
            sleep,
            breaks,
            stress,
            burnout,
            productivity,
            recommendation
        });

        const savedLog = await logEntry.save();
        res.status(201).json(savedLog);
    } catch (err) {
        console.error("Error saving study log:", err);
        res.status(500).json({ error: "Failed to save study log to database." });
    }
});

// GET /api/logs - Retrieve all logs, newest first
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await StudyLog.find().sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        console.error("Error retrieving study logs:", err);
        res.status(500).json({ error: "Failed to retrieve study logs." });
    }
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
