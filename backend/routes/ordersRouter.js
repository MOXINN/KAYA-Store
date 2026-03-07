const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");

// 1. Import all 6 functions from your newly completed controller
const {
  processCheckout,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// 2. Import your Authentication Middlewares (Correctly pointed to your controllers!)
const { authMiddleware: userAuth } = require("../controllers/usersController");
const { authMiddleware: ownerAuth } = require("../controllers/ownersController");

// --- VALIDATION RULES ---
// This ensures no one can submit empty or malicious data to your checkout
const checkoutValidation = [
  body("shippingAddress.street").trim().notEmpty().withMessage("Street address is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.phone").trim().notEmpty().withMessage("Phone number is required"),
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("paymentMethod")
    .optional()
    .isIn(["COD", "Razorpay", "Stripe", "UPI"])
    .withMessage("Invalid payment method"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

// --- USER ROUTES (Requires User Token) ---

// @route   POST /orders/checkout
// @desc    Process cart, handle payment, and create order
router.post("/checkout", userAuth, checkoutValidation, processCheckout);

// @route   GET /orders/my-orders
// @desc    Get all orders for the current logged-in user
router.get("/my-orders", userAuth, getUserOrders);

// @route   GET /orders/my-orders/:orderId
// @desc    Get a specific order receipt
router.get(
  "/my-orders/:orderId",
  userAuth,
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  getOrderById
);

// @route   PUT /orders/cancel/:orderId
// @desc    Cancel an order (only if status is Pending/Confirmed)
router.put(
  "/cancel/:orderId",
  userAuth,
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  cancelOrder
);


// --- OWNER / ADMIN ROUTES (Requires Owner Token) ---

// @route   GET /orders/all
// @desc    Get all orders across the entire platform (Seller Dashboard)
router.get("/all", ownerAuth, getAllOrders);

// @route   GET /orders/all/:orderId
// @desc    Get a specific order by ID (Seller Dashboard)
router.get(
  "/all/:orderId",
  ownerAuth,
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  getOrderById
);

// @route   PUT /orders/status/:orderId
// @desc    Update order status (e.g., mark as "Shipped" or "Delivered")
router.put(
  "/status/:orderId",
  ownerAuth,
  param("orderId").isMongoId().withMessage("Invalid Order ID"),
  body("orderStatus")
    .optional()
    .isIn([
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ])
    .withMessage("Invalid order status"),
  updateOrderStatus
);

module.exports = router;