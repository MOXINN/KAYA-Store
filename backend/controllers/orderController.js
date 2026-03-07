const mongoose = require("mongoose");
const Order = require("../models/order-model");
const User = require("../models/user-model");
const Product = require("../models/product-model");

//
// 1. CREATE ORDER / CHECKOUT (USER)
// 
exports.processCheckout = async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode, paymentIntentId } = req.body;

  // 1. Basic Validation BEFORE opening the database lock
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone || !shippingAddress.fullName) {
    return res.status(400).json({ success: false, message: "Incomplete shipping address provided." });
  }

  // Start Transaction Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id; // From authMiddleware

    // Fetch User with Cart Items securely within the transaction
    const user = await User.findById(userId).populate("cart.productId").session(session);

    if (!user || !user.cart || user.cart.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    let itemsPrice = 0;
    const orderItems = [];
    const stockErrors = [];

    // Process Cart Items
    for (const cartItem of user.cart) {
      const product = cartItem.productId;

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: "An item in your cart is no longer available." });
      }

      // Stock Check
      if (product.stock < cartItem.quantity) {
        stockErrors.push(`${product.name} (Only ${product.stock} left)`);
        continue; 
      }

      const subtotal = product.price * cartItem.quantity;
      itemsPrice += subtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.imageUrl || (product.images && product.images[0]?.url) || "No Image",
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
        price: product.price,
        subtotal,
      });
    }

    // If stock errors exist, safely abort and notify frontend
    if (stockErrors.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: `Stock issues: ${stockErrors.join(", ")}` });
    }

    // Financials
    const shippingPrice = itemsPrice < 1000 ? 100 : 0;
    const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
    let discount = 0; // Add coupon logic here later if needed
    const totalAmount = itemsPrice + shippingPrice + taxPrice - discount;

    // Status Assignment
    let orderStatus = paymentMethod === "COD" ? "Confirmed" : "Pending";
    let paymentStatus = paymentIntentId ? "Paid" : "Pending";
    if (paymentIntentId && paymentMethod !== "COD") orderStatus = "Processing";

    // Create Order Document
    const newOrder = new Order({
      user: userId,
      products: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      orderStatus,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discount,
      totalAmount,
      paymentDetails: {
        transactionId: paymentIntentId || null,
        paymentGateway: paymentMethod === "COD" ? "Cash" : paymentMethod,
      },
    });

    await newOrder.save({ session });

    // Deduct Stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }, { session });
    }

    // Clear Cart
    user.cart = [];
    await user.save({ session });

    // Commit and release lock
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order placed successfully 🎉",
      orderId: newOrder.orderNumber,
      order: newOrder,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, message: "Checkout failed.", error: error.message });
  }
};

// 
// 2. GET USER'S ORDERS (USER)
// 
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
  }
};

// 
// 3. GET SINGLE ORDER BY ID (USER & OWNER)
// 
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("user", "fullname email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Security: Ensure users can only see their own orders (Owners can see all)
    if (req.user && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
};

// 
// 4. CANCEL ORDER (USER)
//
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Security Check
    if (order.user.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: "Not authorized to cancel this order" });
    }

    // Only allow cancellation if it hasn't shipped yet
    if (order.orderStatus !== "Pending" && order.orderStatus !== "Confirmed" && order.orderStatus !== "Processing") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: `Cannot cancel order. Status is already: ${order.orderStatus}` });
    }

    // 1. Change Status
    order.orderStatus = "Cancelled";
    await order.save({ session }); // Triggers the history and timestamp hooks!

    // 2. AUTO-RESTORE INVENTORY: Give the Khadi/Gamcha back to the factory stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Order successfully cancelled and inventory restored.", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Error cancelling order", error: error.message });
  }
};


// 5. GET ALL ORDERS (OWNER DASHBOARD)
// 
exports.getAllOrders = async (req, res) => {
  try {
    // Populate user info so the seller dashboard can display customer names
    const orders = await Order.find().populate("user", "fullname email contactnumber").sort({ createdAt: -1 });
    
    // Quick math to show total revenue on the dashboard
    const totalRevenue = orders.reduce((sum, order) => sum + (order.paymentStatus === 'Paid' ? order.totalAmount : 0), 0);

    res.status(200).json({ success: true, count: orders.length, totalRevenue, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching all orders", error: error.message });
  }
};

// 
// 6. UPDATE ORDER STATUS (OWNER DASHBOARD)
// 
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, courierName } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // We use order.save() instead of findByIdAndUpdate so your statusHistory hook triggers
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;

    // If marking as delivered and it was COD, auto-mark it as Paid!
    if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    res.status(200).json({ success: true, message: `Order updated to ${orderStatus}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
  }
};