const Product = require("../models/product-model");
const Owner = require("../models/owner-model");

//  Get All Products (For the Homepage)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'shopName');
    
    // Send the data as JSON so Next.js can read it
    res.status(200).json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

//  Get Single Product (For Product Details Page)
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'shopName');
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Create Product (Only for Owners)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      description,
      category,
      fabricType,
      color,
      pattern,
      size,
      price,
      discountPrice,
      stock,
      images,
      materialOrigin,
      handwoven,
      tags,
      isFeatured
    } = req.body;

    // Validate required fields from schema
    if (!name || !description || !category || !fabricType || !color || !price || stock === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields (name, description, category, fabricType, color, price, stock)" 
      });
    }

    // Create the new product in memory
    const newProduct = new Product({
      name,
      brand,
      description,
      category,
      fabricType,
      color,
      pattern,
      size,
      price,
      discountPrice,
      stock,
      images,
      materialOrigin,
      handwoven,
      tags,
      isFeatured,
    });

    // Save it to MongoDB
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully! 🎉",
      product: newProduct
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ 
      message: "Server error creating product", 
      error: error.message 
    });
  }
};


 // Add to cart 
   exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // 1. Find the User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", redirectToLogin: true });
    }

    // 2.  NEW: Check Product Stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product no longer exists" });
    }

    // 3. Find if item is already in cart
    const existingCartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    // Calculate the total quantity they are trying to have in their cart
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;
    const newTotalQuantity = currentQuantityInCart + quantity;

    // 4. NEW: Prevent adding more than what's in stock
    if (newTotalQuantity > product.stock) {
       return res.status(400).json({ 
         message: `Sorry, only ${product.stock} items available in stock.`,
         availableStock: product.stock
       });
    }

    // 5. Update Cart
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.json({
      message: "Product added to cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding product to cart",
      error: error.message,
    });
  }
};