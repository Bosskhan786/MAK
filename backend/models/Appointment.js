// models/Appointment.js  –  fixed
const mongoose = require("mongoose");

// FIX: Was using String for every field — no type safety, no validation.
//      Using proper types now. Date is a proper Date object (not a string).
//      Added timestamps for createdAt / updatedAt (useful for admin views).
//      Added an index on userId for fast per-user queries.

const appointmentSchema = new mongoose.Schema(
  {
    userId:  { type: String, required: true, index: true },
    name:    { type: String, required: true, trim: true, maxlength: 120 },
    email:   { type: String, required: true, trim: true, lowercase: true },
    date:    { type: Date,   required: true },
    message: { type: String, default: "", maxlength: 1000 },
    age:     { type: String, default: "" },
    gender:  { type: String, default: "" },
    service: { type: String, default: "" },
    status: {
    type:    String,
    enum:    ["pending", "confirmed", "cancelled"],
    default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);