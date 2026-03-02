const Owner = require("../models/owner-model");
const generateToken = require("../utils/generateToken");


// Register Owner
exports.registerOwner = async (req, res) => {
  try {
    const { name, email, password, shopName, phone, address, shopDescription, gstNumber } = req.body;

    if (!name || !email || !password || !shopName) {
      return res.status(400).json({ message: "Name, Email, Password, and Shop Name are required." });
    }

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: "Owner with this email already exists." });
    }

    const newOwner = new Owner({
      name,
      email,
      password,
      shopName,
      phone,
      address,
      shopDescription,
      gstNumber,
    });

    await newOwner.save();

    res.status(201).json({ message: "Owner registered successfully! Please log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};


//Login Owner

exports.loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both email and password." });
    }

    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await owner.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate token using generateToken.js
    const token = generateToken({ id: owner._id, email: owner.email });

    // Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        shopName: owner.shopName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};


// Verify Token Middleware

exports.authMiddleware = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const { jwtSecret } = require("../config/Keys");

  const authHeader = req.header("Authorization") || req.cookies.token;

  if (!authHeader)
    return res.status(401).json({ message: "Access denied. No token provided." });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.owner = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};


// Get Owner Profile

exports.getOwnerProfile = async (req, res) => {
  try {
    const owner = await Owner.findById(req.owner.id).select("-password").populate("products");

    if (!owner) {
      return res.status(404).json({ message: "Owner not found." });
    }

    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile.", error: error.message });
  }
};
