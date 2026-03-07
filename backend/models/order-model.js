const mongoose = require("mongoose");

// --- Sub-Schemas ---

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, 
  image: { type: String, required: true }, 
  quantity: { 
    type: Number, 
    required: true, 
    min: [1, "Quantity cannot be less than 1"] 
  },
  size: { type: String },
  color: { type: String },
  price: { type: Number, required: true, min: 0 }, 
  subtotal: { type: Number, required: true, min: 0 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  country: { type: String, default: "India", trim: true },
});

// --- Main Order Schema ---

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    products: [orderItemSchema],
    shippingAddress: shippingAddressSchema,

    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Stripe", "UPI", "PayPal"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
      index: true, 
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
      index: true, 
    },

    // Financials
    itemsPrice: { type: Number, required: true, default: 0, min: 0 },
    shippingPrice: { type: Number, default: 0, min: 0 },
    taxPrice: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // Metadata
    couponCode: { type: String, trim: true },
    paymentDetails: {
      transactionId: String,
      paymentGateway: String,
      receiptUrl: String, 
    },
    trackingNumber: { type: String, trim: true },
    courierName: { type: String, trim: true }, // e.g., Delhivery, BlueDart, India Post

    // Auto-Captured Timestamps
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    
    // Audit Trail
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, // REQUIRED: Allows frontend to see the virtual fields below
    toObject: { virtuals: true }
  }
);

// --- Indexes for Lightning Fast Queries ---
// These make the Seller Dashboard load instantly when filtering orders
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

// --- Virtual Properties (Dynamic Fields) ---
orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'Paid';
});

orderSchema.virtual('isDelivered').get(function() {
  return this.orderStatus === 'Delivered';
});

// --- Middleware Hooks ---

// 1. Generate Unique Order Number & Set Initial History
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    // Format: ORD-YYYYMMDD-Random
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${date}-${random}`;

    // Add the very first history log securely
    this.statusHistory.push({
      status: this.orderStatus,
      note: "Order placed successfully",
    });
  }
  next();
});

// 2. Validate Totals, Auto-Set Timestamps, & Track Status Changes
orderSchema.pre("save", function (next) {
  // Financial Math Validation
  const calculatedTotal = this.itemsPrice + this.shippingPrice + this.taxPrice - this.discount;
  if (Math.abs(calculatedTotal - this.totalAmount) > 0.01) {
    return next(new Error(`Total amount calculation is incorrect. Expected ${calculatedTotal}, got ${this.totalAmount}`));
  }

  // Automate the Audit Trail and Timestamps
  if (this.isModified("orderStatus") && !this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      note: `Status updated to ${this.orderStatus}`,
    });

    // Auto-fill dates based on status
    if (this.orderStatus === "Shipped" && !this.shippedAt) this.shippedAt = Date.now();
    if (this.orderStatus === "Delivered" && !this.deliveredAt) this.deliveredAt = Date.now();
    if (this.orderStatus === "Cancelled" && !this.cancelledAt) this.cancelledAt = Date.now();
  }

  // Auto-fill paidAt date
  if (this.isModified("paymentStatus") && this.paymentStatus === "Paid" && !this.paidAt) {
    this.paidAt = Date.now();
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);