const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

//  MOVED THIS UP! Load env variables FIRST before requiring anything else
dotenv.config({ path: path.join(__dirname, ".env") });

// NOW it is safe to load the database connection because process.env is populated
const connectDB = require("./config/mongoose-connection");

const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/users", require("./routes/usersRouter"));
app.use("/owners", require("./routes/ownersRouter"));
app.use("/products", require("./routes/productsRouter"));
app.use("/orders", require("./routes/ordersRouter"));

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