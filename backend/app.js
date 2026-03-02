const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongoose-connection");

// Load env variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/users", require("./routes/usersRouter"));
app.use("/owners", require("./routes/ownersRouter"));
app.use("/products", require("./routes/productsRouter"));

// Health Route
app.get("/", (req, res) => {
  res.json({ message: "Kaya API Running" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

module.exports = app;
