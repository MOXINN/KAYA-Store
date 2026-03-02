const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
const config = require("config");

const mongoURI = config.get("MONGODB_URI");

async function connectDB() {
  try {
    await mongoose.connect(`${mongoURI}/Kaya`); //  No deprecated options

    console.log("MongoDB connected successfully (Kaya DB)");
    dbgr("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    dbgr(err);
  }
}

module.exports = connectDB;
