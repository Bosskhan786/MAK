// routes/appointment.js
const express = require("express");
const jwt     = require("jsonwebtoken");
const Appointment = require("../models/Appointment");

const router = express.Router();

// ── Middleware: Verify JWT ──────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided. Please login." });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured.");

    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token. Please login again." });
  }
}

// ── POST /api/appointments – Create ────────────────────
router.post("/", authMiddleware, async (req, res) => {
  const { name, email, date, message, age, gender} = req.body;

  if (!name || !email || !date) {
    return res.status(400).json({ message: "Name, email, and date are required." });
  }

  try {
    const appointment = new Appointment({
      userId:  req.user.id,
      name,
      email,
      date,
      message: message || "",
      age: age || "",
      gender: gender || ""
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully." });

  } catch (err) {
    console.error("Appointment create error:", err);
    res.status(500).json({ message: "Server error. Could not book appointment." });
  }
});

// ── GET /api/appointments – List (current user) ────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(appointments);

  } catch (err) {
    console.error("Appointment fetch error:", err);
    res.status(500).json({ message: "Server error. Could not fetch appointments." });
  }
});

module.exports = router;