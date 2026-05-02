// models/User.js  –  fixed
const mongoose = require("mongoose");

// FIX: No unique index on email — duplicate accounts possible during
//      a race condition even with the application-level check.
// FIX: Added timestamps for createdAt / updatedAt.
// FIX: Added googleId field so Google OAuth users can be found
//      without relying on the placeholder password "google-oauth".

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 120 },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, default: null }, // null for pure OAuth users
    googleId: { type: String, default: null, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);