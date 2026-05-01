// server.js
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");

const authRoutes        = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");

const app = express();

connectDB();

// ── CORS: allow your Vercel frontend ──────────────────────
app.use(cors({
  origin: "https://docmak-puce.vercel.app"
}));

app.use(express.json());

// ── Routes (use PATH strings, not full URLs) ──────────────
app.use("/api/auth",         authRoutes);
app.use("/api/appointments", appointmentRoutes);

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});