const Product = require("../models/product-model");
const User = require("../models/user-model");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/Keys");

//
// REGISTER USER
//
exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      contactnumber,
    } = req.body;

    // Required fields check
    if (!email || !password || !contactnumber) {
      return res.status(400).json({
        message: "Email, password and contact number are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        message: "Email already registered. Please log in.",
        redirectToLogin: true,
        email: existingUser.email,
      });
    }

    // Create user (password will be hashed automatically via pre-save hook)
    const newUser = new User({
      email,
      password,
      contactnumber,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};


//
// LOGIN USER
//
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & Password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate token (your utils file)
    const token = generateToken({ id: user._id, email: user.email });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};


//
//  AUTH MIDDLEWARE
//
exports.authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.cookies.token;

  if (!authHeader)
    return res.status(401).json({ message: "Access denied. No token provided" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size, color } = req.body; // Extract size and color

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const Product = require("../models/product-model");
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product no longer exists" });

    // SMART FIND: Check if the exact same product, size, AND color is already in the cart
    const existingCartItem = user.cart.find(
      (item) => 
        item.productId.toString() === productId && 
        item.size === size && 
        item.color === color
    );

    // Stock check (simplified)
    const currentQty = existingCartItem ? existingCartItem.quantity : 0;
    if (currentQty + quantity > product.stock) {
       return res.status(400).json({ message: `Only ${product.stock} items left in stock.` });
    }

    if (existingCartItem) {
      // If same size/color exists, just add to quantity
      existingCartItem.quantity += quantity;
    } else {
      // If it's a new size/color, add it as a new row in the cart
      user.cart.push({ productId, quantity, size, color });
    }

    await user.save();

    res.json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    console.log("CART ERROR:", error);
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

//REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.itemId; // Get the specific item ID from the URL

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter out the item that matches the ID we want to remove
    user.cart = user.cart.filter((item) => item._id.toString() !== cartItemId);

    await user.save();

    res.status(200).json({ message: "Item removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
};



//
//  GET PROFILE
//
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};


//
// UPDATE PROFILE
//
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password)
      return res.status(400).json({
        message: "Password cannot be updated from this route",
      });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

//  GET CART ITEMS
exports.getCart = async (req, res) => {
  try {
    // Find the user and "populate" the product details for each item in the cart
    const user = await User.findById(req.user.id).populate("cart.productId");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cart",
      error: error.message,
    });
  }
};
