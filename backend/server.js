require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const session   = require("express-session");
const passport  = require("passport");
const connectDB = require("./config/db");

require("./config/passport"); // Google strategy

const authRoutes        = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");

const app = express();

connectDB();

app.use(cors({
  origin: ["https://docmak.vercel.app", "https://docmak-puce.vercel.app"],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "mak_secret_123",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth",         authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => res.send("Backend Working ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));