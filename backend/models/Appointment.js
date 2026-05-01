const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  date: String,
  message: String,
  age:    String,
  gender: String,
});

module.exports = mongoose.model("Appointment", appointmentSchema);