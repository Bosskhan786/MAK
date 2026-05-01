// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("https://doc-mak.onrender.com/api/auth", authRoutes);
app.use("https://doc-mak.onrender.com/api/appointments", appointmentRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

const cors = require("cors");

app.use(cors({
  origin: "https://docmak-puce.vercel.app"
}));