// config/db.js
// ⚠️  Store MONGO_URI in a .env file — never hardcode credentials in source code.
// Create a .env file at the project root:
//   MONGO_URI=mongodb+srv://AdeebKhan:<password>@...mongodb.net/?retryWrites=true&w=majority

const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined. Add it to your .env file.");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("DB Error:", err.message);
    process.exit(1); // Exit on DB failure — don't run with a broken connection
  }
};

module.exports = connectDB;