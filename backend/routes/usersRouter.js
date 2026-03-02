const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  authMiddleware,
  getProfile,
  updateProfile,
  addToCart,
  getCart,
  removeFromCart
} = require("../controllers/usersController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/update", authMiddleware, updateProfile);
router.post("/cart", authMiddleware, addToCart);
router.get("/cart", authMiddleware, getCart);
router.delete("/cart/:itemId", authMiddleware, removeFromCart);

module.exports = router;
