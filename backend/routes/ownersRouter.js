const express = require("express");
const router = express.Router();
const {
  registerOwner,
  loginOwner,
  authMiddleware,
  getOwnerProfile
} = require("../controllers/ownersController");

// Register
router.post("/register", registerOwner);

// Login
router.post("/login", loginOwner);

// Profile
router.get("/profile", authMiddleware, getOwnerProfile);

module.exports = router;
