const Product = require("../models/product-model");
const User = require("../models/user-model");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/Keys");

// 
// 1. AUTHENTICATION (Register, Login, Auth)
// 

exports.registerUser = async (req, res) => {
  try {
    const { email, password, contactnumber, fullname } = req.body;

    if (!email || !password || !contactnumber) {
      return res.status(400).json({ success: false, message: "Email, password and contact number are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered. Please log in." });
    }

    const newUser = new User({ email, password, contactnumber, fullname });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during registration", error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email & Password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken({ id: user._id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, fullname: user.fullname, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login", error: error.message });
  }
};

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.cookies.token;
  if (!authHeader) return res.status(401).json({ success: false, message: "Access denied. No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid token" });
  }
};

// 
// 2. PROFILE MANAGEMENT (For Dashboard)
// 

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullname, email, contactnumber, address } = req.body;

    // Use findByIdAndUpdate to handle nested address object safely
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullname, email, contactnumber, address },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    user.password = newPassword; // Triggering pre-save hash hook
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating password", error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting account", error: error.message });
  }
};

// 
// 3. CART MANAGEMENT
// 

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.productId");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size, color } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product no longer exists" });

    const existingCartItem = user.cart.find(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color
    );

    const currentQty = existingCartItem ? existingCartItem.quantity : 0;
    if (currentQty + quantity > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock.` });
    }

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity, size, color });
    }

    await user.save();
    res.json({ success: true, message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter((item) => item._id.toString() !== req.params.itemId);
    await user.save();
    res.status(200).json({ success: true, message: "Item removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing item", error: error.message });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ success: false, message: "Quantity must be at least 1" });

    const user = await User.findById(req.user.id);
    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    const product = await Product.findById(cartItem.productId);
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} left in stock.` });
    }

    cartItem.quantity = quantity;
    await user.save();
    res.status(200).json({ success: true, message: "Quantity updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating quantity", error: error.message });
  }
};