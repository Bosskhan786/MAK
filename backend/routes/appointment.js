// routes/appointment.js  –  fixed + hardened
const express     = require("express");
const jwt         = require("jsonwebtoken");
const mongoose    = require("mongoose");
const Appointment = require("../models/Appointment");

const router = express.Router();

// ── Auth Middleware ───────────────────────────────────────────
// FIX: Original accepted the token straight from headers.authorization
//      without checking for the common "Bearer <token>" prefix.
//      Both raw tokens AND "Bearer <token>" are now handled.
function authMiddleware(req, res, next) {
  const raw = req.headers.authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  if (!token)
    return res.status(401).json({ message: "No token provided. Please login." });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured.");
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session. Please login again." });
  }
}

// ── POST /api/appointments  –  Create ────────────────────────
// FIX: Was not validating / trimming any of the optional fields.
// FIX: Added date validation (must be a real future date).
// FIX: Added field-length caps to prevent oversized DB writes.
router.post("/", authMiddleware, async (req, res) => {
  const name    = (req.body.name    || "").trim();
  const email   = (req.body.email   || "").trim().toLowerCase();
  const dateRaw = (req.body.date    || "").trim();
  const message = (req.body.message || "").trim().slice(0, 1000);
  const age     = (req.body.age     || "").toString().trim();
  const gender  = (req.body.gender  || "").trim();
  const service = (req.body.service || "").trim();

  if (!name || !email || !dateRaw)
    return res.status(400).json({ message: "Name, email, and date are required." });

  if (name.length > 120)
    return res.status(400).json({ message: "Name is too long." });

  // FIX: Validate date is a real date and not in the past.
  const apptDate = new Date(dateRaw);
  if (isNaN(apptDate.getTime()))
    return res.status(400).json({ message: "Please provide a valid date." });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (apptDate < today)
    return res.status(400).json({ message: "Appointment date cannot be in the past." });

  try {
    const appointment = new Appointment({
      userId:  req.user.id,
      name,
      email,
      date:    apptDate,
      message,
      age,
      gender,
      service,
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully.", id: appointment._id });

  } catch (err) {
    console.error("Appointment create error:", err);
    res.status(500).json({ message: "Server error. Could not book appointment." });
  }
});

// ── GET /api/appointments  –  List (current user) ────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment
      .find({ userId: req.user.id })
      .sort({ date: 1 })
      .lean(); // FIX: .lean() returns plain objects — faster for read-only list
    res.json(appointments);

  } catch (err) {
    console.error("Appointment fetch error:", err);
    res.status(500).json({ message: "Server error. Could not fetch appointments." });
  }
});

// ── DELETE /api/appointments/:id ──────────────────────────────
// FIX: Was missing ObjectId validation — an invalid id crashed with a
//      CastError instead of a clean 400 response.
router.delete("/:id", authMiddleware, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid appointment ID." });

  try {
    const appt = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!appt) return res.status(404).json({ message: "Appointment not found." });

    await appt.deleteOne();
    res.json({ message: "Appointment cancelled." });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Could not cancel appointment." });
  }
});

module.exports = router;