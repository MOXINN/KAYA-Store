/**
 * Express Application Entry Point
 * -----------------------------------------
 * Initializes the server, connects to MongoDB,
 * sets up middlewares, and loads routes.
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
// const dotenv = require("dotenv");

// Load environment variables
// dotenv.config();

// Import database connection
const connectDB = require("./config/mongoose-connection");

// Initialize express
const app = express();

// Connect to MongoDB
// connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "ejs");

// Import Routes

const ownersRouter = require("./routes/ownersRouter");
app.use("/owners", ownersRouter);

const usersRouter = require("./routes/usersRouter");
app.use("/users", usersRouter);

const productsRouter = require("./routes/productsRouter");
app.use("/products", productsRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
