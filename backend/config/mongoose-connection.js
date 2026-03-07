const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
const config = require("config");

const mongoURI = process.env.MONGO_URI || config.get("MONGODB_URI");

async function connectDB() {
  try {
    await mongoose.connect(mongoURI) //  No deprecated options

    console.log(`MongoDB connected successfully! (${mongoURI.includes('127.0.0.1') ? 'LOCAL' : 'ATLAS CLOUD'})`);
    dbgr("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    dbgr(err);
  }
}

module.exports = connectDB;
