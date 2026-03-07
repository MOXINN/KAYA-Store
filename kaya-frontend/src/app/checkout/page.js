"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "pk_test_your_key");

// --- HELPER: Indian Currency Formatter ---
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [errors, setErrors] = useState({});

  // -----------------------------
  // FETCH CART
  // -----------------------------
  useEffect(() => {
    fetchCart();
    const savedAddress = localStorage.getItem("shippingAddress");
    if (savedAddress) {
      setShippingAddress(JSON.parse(savedAddress));
    }
  }, []);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.cart && data.cart.length > 0) {
        setCartItems(data.cart);
      } else {
        toast.error("Your cart is empty. Redirecting...");
        setTimeout(() => router.push("/cart"), 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // -----------------------------
  // CALCULATIONS
  // -----------------------------
  const itemsTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (!item.productId) return total;
      return total + item.productId.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const shippingCost = useMemo(() => (itemsTotal >= 1000 ? 0 : 100), [itemsTotal]);
  const tax = useMemo(() => Math.round(itemsTotal * 0.05), [itemsTotal]);
  const grandTotal = useMemo(() => itemsTotal + shippingCost + tax - discount, [itemsTotal, shippingCost, tax, discount]);

  // -----------------------------
  // HANDLE INPUT
  // -----------------------------
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const updated = { ...shippingAddress, [name]: value };
    setShippingAddress(updated);
    localStorage.setItem("shippingAddress", JSON.stringify(updated));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [shippingAddress, errors]);

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!shippingAddress.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(shippingAddress.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!shippingAddress.street.trim()) newErrors.street = "Street address is required";
    if (!shippingAddress.city.trim()) newErrors.city = "City is required";
    if (!shippingAddress.state.trim()) newErrors.state = "State is required";
    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [shippingAddress]);

  // -----------------------------
  // COUPON LOGIC
  // -----------------------------
  const applyCoupon = useCallback(async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setApplyingCoupon(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponCode: coupon.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setDiscount(data.discount || Math.round(itemsTotal * 0.1));
        setCouponApplied(true);
        toast.success(`Coupon "${coupon}" applied successfully! 🎉`);
      } else {
        toast.error(data.message || "Invalid coupon code");
        setCouponApplied(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }, [coupon, itemsTotal]);

  const removeCoupon = useCallback(() => {
    setDiscount(0);
    setCoupon("");
    setCouponApplied(false);
    toast.success("Coupon removed");
  }, []);

  // -----------------------------
  // CREATE STRIPE PAYMENT INTENT
  // -----------------------------
  const createPaymentIntent = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: grandTotal, currency: "INR" }),
      });
      const data = await res.json();
      if (res.ok) return data.clientSecret;
      throw new Error(data.message || "Failed to create payment intent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create payment intent");
      return null;
    }
  }, [grandTotal]);

  // -----------------------------
  // PLACE ORDER
  // -----------------------------
  const handleCheckout = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the shipping form");
      return;
    }

    setProcessing(true);
    const token = localStorage.getItem("token");

    try {
      let currentPaymentIntentId = null;

      // For online payments, create payment intent first
      if (paymentMethod === "Online") {
        setStripeLoading(true);
        const clientSecret = await createPaymentIntent();

        if (!clientSecret) {
          setProcessing(false);
          setStripeLoading(false);
          return;
        }
        currentPaymentIntentId = clientSecret;
        setPaymentIntentId(clientSecret);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
          couponCode: couponApplied ? coupon : null,
          paymentIntentId: currentPaymentIntentId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("shippingAddress");
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Order placed successfully! 🎉");
        router.push(`/orders/success?id=${data.orderId}`);
      } else {
        toast.error(data.message || "Checkout failed");
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
      setProcessing(false);
    } finally {
      setStripeLoading(false);
    }
  }, [validateForm, shippingAddress, paymentMethod, coupon, couponApplied, createPaymentIntent, router]);

  // -----------------------------
  // LOADING SKELETON UI
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
             <div className="h-8 bg-gray-900 rounded w-48 animate-pulse mb-8"></div>
             <div className="h-[500px] bg-gray-900 rounded-2xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-5">
             <div className="h-[400px] bg-gray-900 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // PAGE UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Shipping & Payment Form */}
        <div className="lg:col-span-7">
          <Link href="/cart" className="text-gray-400 hover:text-emerald-400 text-sm font-medium mb-8 inline-flex items-center gap-2 transition-colors">
            &larr; Return to Cart
          </Link>
          <h1 className="text-3xl font-light tracking-wide mb-8">Secure Checkout</h1>

          <form onSubmit={handleCheckout} className="bg-[#111] border border-white/5 p-8 rounded-2xl shadow-2xl space-y-8">
            
            {/* Shipping Address Section */}
            <div>
              <h2 className="text-xl font-medium text-emerald-400 mb-6">1. Shipping Address</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input
                      name="fullName"
                      placeholder="Full Name"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${errors.fullName ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <input
                      name="phone"
                      placeholder="Phone Number (10 digits)"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${errors.phone ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <input
                    name="street"
                    placeholder="Street Address (House No, Building, Area)"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-900 border ${errors.street ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <input
                      name="city"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${errors.city ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.city}</p>}
                  </div>
                  <div>
                    <input
                      name="state"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${errors.state ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.state}</p>}
                  </div>
                  <div>
                    <input
                      name="pincode"
                      placeholder="PIN Code"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${errors.pincode ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-800" />

            {/* Payment Method Section */}
            <div>
              <h2 className="text-xl font-medium text-emerald-400 mb-6">2. Payment Method</h2>
              <div className="space-y-4">
                
                {/* COD Option */}
                <label className={`block relative border rounded-xl p-5 cursor-pointer transition-all ${paymentMethod === "COD" ? "bg-emerald-900/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-gray-900 border-gray-800 hover:border-gray-600"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-emerald-500" : "border-gray-500"}`}>
                      {paymentMethod === "COD" && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-lg font-medium text-white block">Cash on Delivery</span>
                      <span className="text-sm text-gray-400">Pay securely when your package arrives.</span>
                    </div>
                  </div>
                </label>

                {/* Online Option */}
                <label className={`block relative border rounded-xl p-5 cursor-pointer transition-all ${paymentMethod === "Online" ? "bg-emerald-900/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-gray-900 border-gray-800 hover:border-gray-600"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "Online" ? "border-emerald-500" : "border-gray-500"}`}>
                      {paymentMethod === "Online" && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-lg font-medium text-white block">Online Payment</span>
                      <span className="text-sm text-gray-400">Pay securely via Credit Card, UPI, or Netbanking.</span>
                    </div>
                  </div>
                </label>

              </div>
            </div>

            <button
              type="submit"
              disabled={processing || stripeLoading}
              className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl text-sm font-bold tracking-[0.15em] uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {processing || stripeLoading ? "Processing Order..." : "Confirm & Place Order"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#111] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-2xl sticky top-8">
            <h2 className="text-xl font-light tracking-wide mb-6 border-b border-gray-800 pb-4">Order Summary</h2>

            {/* Mini Cart List */}
            <div className="space-y-4 mb-8 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-4">
                  <div className="w-16 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-gray-800">
                    {item.productId?.images?.[0]?.url && (
                      <img src={item.productId.images[0].url} alt="product" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{item.productId?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatINR(item.productId?.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon System */}
            <div className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter Coupon Code"
                  className="flex-1 bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors uppercase placeholder:text-gray-600 placeholder:normal-case"
                  disabled={applyingCoupon || couponApplied}
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !coupon.trim() || couponApplied}
                  className="bg-gray-800 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <div className="flex items-center justify-between mt-3 bg-emerald-900/20 border border-emerald-900/50 p-3 rounded-lg">
                  <span className="text-sm text-emerald-400 font-medium">✨ Coupon applied</span>
                  <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-300 font-medium tracking-wide uppercase">Remove</button>
                </div>
              )}
            </div>

            {/* Financial Math */}
            <div className="space-y-4 text-sm text-gray-400 font-light mb-6">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="text-white font-medium">{formatINR(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-white font-medium">{shippingCost === 0 ? "Free" : formatINR(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <span className="text-white font-medium">{formatINR(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex justify-between items-end">
                <span className="text-lg font-medium text-white">Grand Total</span>
                <span className="text-3xl font-light text-emerald-400">{formatINR(grandTotal)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}