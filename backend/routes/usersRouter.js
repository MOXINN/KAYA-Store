const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  authMiddleware,
  getProfile,
  updateProfile,
  updatePassword, 
  deleteAccount,
  addToCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity
} = require("../controllers/usersController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", authMiddleware, updateProfile);

// Cart routes...
router.post("/cart", authMiddleware, addToCart);
router.get("/cart", authMiddleware, getCart);
router.delete("/cart/:itemId", authMiddleware, removeFromCart);
router.patch("/cart/:itemId", authMiddleware, updateCartItemQuantity);

// user dashboard
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/update-password", authMiddleware, updatePassword);
router.delete("/profile", authMiddleware, deleteAccount);

module.exports = router;
