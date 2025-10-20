const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new monngoose.Schema({
    fullname: {
        type: String,
        required: [true, "Full Name is required"],
        minLength: 3,
        maxLength: 2253,
        trim: true,
    },
    email: {
        type : String,
        required : [true, "Email is required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"],
    },
    contactnumber: {
        type: Number,
        required: [true , "Contact number is required"],
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit contact number"],
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: Number,
        country: { type: String, default: "India"},
    },
    gender: {
        type: String,
        enum: ["Male","Female","Others"],
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, default: 1},
        },
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    notifications: [
        {
        title: String,
        message: String,
        read: { type: Boolean, default: false },
        createAt: { type: Date, default: Date.now },
        },
    ],
    isAdmin:{
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model("user", userSchema);