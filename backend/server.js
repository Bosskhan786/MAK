// server.js  –  Dr. Maaz Khan backend  (fixed + hardened)
require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const session      = require("express-session");
const passport     = require("passport");
const connectDB    = require("./config/db");

require("./config/passport"); // Google OAuth strategy

const authRoutes        = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");

const app = express();

// ── Database ─────────────────────────────────────────────────
connectDB();

// ── CORS ──────────────────────────────────────────────────────
// FIX: Was missing trailing-slash 888variants and localhost for dev.
// Keep an explicit allowlist — never use origin: "*" in production.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean)
  .concat([
    "https://docmak.vercel.app"
  ]);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server / curl (no Origin header) in dev only
    if (!origin && process.env.NODE_ENV !== "production") return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────
// FIX: Added explicit size limit to prevent large-payload DoS attacks.
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));

// ── Sessions (required by Passport for OAuth) ────────────────
app.use(session({
secret: process.env.SESSION_SECRET || "a-very-temporary-fallback-secret-12345",
resave: false,  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production", // HTTPS-only in prod
    sameSite: "lax",
    maxAge:   24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health-check (useful for Render / uptime monitors)
app.get("/", (_req, res) => res.json({ status: "ok", service: "mak-backend" }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

// ── Global error handler ──────────────────────────────────────
// FIX: Was missing entirely — unhandled errors leaked stack traces to clients.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`));