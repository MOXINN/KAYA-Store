/**
 * Owner Model
 * -----------------------------
 * Defines the Owner schema with authentication, shop details, and relations.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Product = require("./product-model");



// Define schema
const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    shopDescription: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Hash password before saving (only if modified)
ownerSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next(); // Skip if password not changed

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//
// Compare Password Method
//
ownerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//
//  Export Model
//
const Owner = mongoose.model("Owner", ownerSchema);
module.exports = Owner;
