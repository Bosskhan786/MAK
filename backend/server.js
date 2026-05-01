// server.js
require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const connectDB = require("./config/db");

const authRoutes        = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");

const app = express();

connectDB();

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://docmak.vercel.app",
    "https://docmak-puce.vercel.app"
  ]
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/appointments", appointmentRoutes);

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => res.send("Backend Working ✅"));

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
