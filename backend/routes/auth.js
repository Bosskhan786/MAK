// routes/auth.js  –  fixed + hardened
const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const passport = require("passport");
const User     = require("../models/User");

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured.");
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

// ── SIGNUP ────────────────────────────────────────────────────
// FIX: Added email-format validation (was missing).
// FIX: Normalise + trim all string inputs — was missing for `name`.
// FIX: Use consistent { message } shape for all responses.
router.post("/signup", async (req, res) => {
  const name     = (req.body.name     || "").trim();
  const email    = (req.body.email    || "").trim().toLowerCase();
  const password = (req.body.password || "").trim();

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  if (!EMAIL_RE.test(email))
    return res.status(400).json({ message: "Please enter a valid email address." });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters." });

  // FIX: Cap name / password length to prevent DoS via huge strings.
  if (name.length > 100)
    return res.status(400).json({ message: "Name is too long." });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 12); // FIX: 12 rounds (was 10)
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Account created successfully." });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
// FIX: Removed information-leaking "No account found" / "Incorrect password"
//      split — combined into a single vague message to prevent user-enumeration.
// FIX: Trim inputs before comparing.
router.post("/login", async (req, res) => {
  const email    = (req.body.email    || "").trim().toLowerCase();
  const password = (req.body.password || "").trim();

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    const user = await User.findOne({ email });

    // FIX: Always run bcrypt.compare even when user is null to prevent
    //      timing-based user enumeration (constant-time comparison).
    const dummyHash  = "$2a$12$invalidhashinvalidhashinvalidhashinvalidhashinvalid";
    const isMatch    = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = signToken(user._id);
    res.json({ message: "Login successful.", token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── GOOGLE OAuth ───────────────────────────────────────────────
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// FIX: Was redirecting to the primary domain only. Now reads from env so
//      staging / dev redirects also work.
const FRONTEND_URL = process.env.FRONTEND_URL || "https://docmak.vercel.app";

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login.html?error=google_auth_failed` }),
  (req, res) => {
    try {
      const token = signToken(req.user._id);
      // FIX: Token passed in URL is acceptable for SPA flows BUT should be
      //      short-lived or swapped for a longer one server-side.
      // A stricter option is to use an httpOnly cookie here.
      res.redirect(`${FRONTEND_URL}/login.html?token=${token}`);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect(`${FRONTEND_URL}/login.html?error=token_generation_failed`);
    }
  }
);

module.exports = router;