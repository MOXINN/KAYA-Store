"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

// --- HELPER: Indian Currency Formatter ---
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(null);
  const [error, setError] = useState(null);

  // -----------------------------
  // FETCH CART
  // -----------------------------
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setCartItems(data.cart || []);
        if (data.couponCode) setCouponApplied(data.couponCode);
      } else {
        setError(data.message || "Failed to load cart");
        toast.error(data.message || "Failed to load cart");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // -----------------------------
  // UPDATE QUANTITY (Optimistic)
  // -----------------------------
  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity < 1) return;

    setUpdating(cartItemId);
    const token = localStorage.getItem("token");

    // 1. Optimistic update (Instant UI feedback)
    setCartItems((prev) =>
      prev.map((item) => (item._id === cartItemId ? { ...item, quantity } : item))
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/cart/${cartItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) throw new Error("Failed to update quantity");

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
      fetchCart(); // 2. Safe Revert: Fetch the source of truth if it fails
    } finally {
      setUpdating(null);
    }
  }, [fetchCart]);

  // -----------------------------
  // REMOVE ITEM
  // -----------------------------
  const handleRemove = useCallback(async (cartItemId) => {
    setRemoving(cartItemId);
    const token = localStorage.getItem("token");

    // Optimistic remove
    setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove item");

      toast.success("Item removed from cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
      fetchCart(); // Safe Revert
    } finally {
      setRemoving(null);
    }
  }, [fetchCart]);

  // -----------------------------
  // COUPON LOGIC
  // -----------------------------
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setCouponApplied(couponCode.trim());
        toast.success(`Coupon "${couponCode}" applied successfully!`);
        fetchCart();
      } else {
        toast.error(data.message || "Failed to apply coupon");
        setCouponApplied(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode, fetchCart]);

  const removeCoupon = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/remove-coupon`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCouponApplied(null);
        setCouponCode("");
        toast.success("Coupon removed");
        fetchCart();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove coupon");
    }
  }, [fetchCart]);

  // -----------------------------
  // CALCULATIONS (Memoized)
  // -----------------------------
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (!item.productId) return total;
      return total + item.productId.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const shipping = useMemo(() => (subtotal > 1000 ? 0 : 100), [subtotal]);
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);

  const discount = useMemo(() => {
    if (couponApplied === "WELCOME10") return Math.round(subtotal * 0.1);
    if (couponApplied === "FREESHIP") return shipping;
    return 0;
  }, [subtotal, couponApplied, shipping]);

  const total = subtotal + shipping + tax - discount;

  // -----------------------------
  // UI: LOADING SKELETON
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-10 w-48 bg-gray-900 rounded animate-pulse mb-10"></div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-6 border-b border-gray-900 pb-6 animate-pulse">
                  <div className="w-24 h-32 bg-gray-900 rounded"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 bg-gray-900 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-900 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-900 rounded w-24 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900/50 p-6 rounded-xl h-64 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // UI: ERROR STATE
  // -----------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center p-8 bg-[#111] rounded-2xl border border-white/5">
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button onClick={fetchCart} className="bg-emerald-600 px-8 py-3 rounded-xl font-medium tracking-wide hover:bg-emerald-500 transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // UI: EMPTY STATE
  // -----------------------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-10 bg-[#111] border border-white/5 rounded-3xl shadow-2xl">
          <div className="text-6xl mb-6 opacity-80">🛍️</div>
          <h1 className="text-2xl font-light tracking-wide mb-3">Your bag is empty</h1>
          <p className="text-gray-500 font-light mb-8">Discover our latest collection of authentic handlooms.</p>
          <Link href="/" className="block w-full bg-emerald-600 px-8 py-4 rounded-xl text-sm font-bold tracking-[0.15em] uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // -----------------------------
  // UI: MAIN CART
  // -----------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light tracking-wide mb-10">Shopping Bag</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <ul className="divide-y divide-gray-800/50">
                {cartItems.map((item) => {
                  const product = item.productId;
                  if (!product) return null;

                  return (
                    <li key={item._id} className="p-6 sm:p-8 flex gap-6 group">
                      
                      {/* Image */}
                      <Link href={`/product/${product._id}`} className="block w-24 h-32 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 relative">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Image</div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-xs text-emerald-400 tracking-widest uppercase mb-1">{product.category}</p>
                            <Link href={`/product/${product._id}`} className="text-lg font-medium hover:text-emerald-400 transition-colors line-clamp-1">
                              {product.name}
                            </Link>
                            
                            <div className="mt-2 text-sm text-gray-400 font-light flex items-center gap-4">
                              {item.size && <span>Size: <strong className="text-gray-200">{item.size}</strong></span>}
                              {item.color && (
                                <span className="flex items-center gap-2">
                                  Color: <span className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: item.color }}></span>
                                </span>
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleRemove(item._id)} 
                            disabled={removing === item._id} 
                            className="text-gray-500 hover:text-red-400 transition-colors p-2 disabled:opacity-50"
                            title="Remove item"
                          >
                            {removing === item._id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            )}
                          </button>
                        </div>

                        {/* Controls & Price */}
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-800 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={updating === item._id} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50">
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={updating === item._id} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50">
                              +
                            </button>
                          </div>
                          <p className="text-xl font-medium">{formatINR(product.price * item.quantity)}</p>
                        </div>
                      </div>

                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-2xl sticky top-8">
              <h2 className="text-xl font-light tracking-wide mb-6 border-b border-gray-800 pb-4">Order Summary</h2>

              {/* Coupon System */}
              <div className="mb-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="flex-1 bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors uppercase placeholder:text-gray-600 placeholder:normal-case"
                    disabled={applyingCoupon || !!couponApplied}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim() || !!couponApplied}
                    className="bg-gray-800 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {couponApplied && (
                  <div className="flex items-center justify-between mt-3 bg-emerald-900/20 border border-emerald-900/50 p-3 rounded-lg">
                    <span className="text-sm text-emerald-400 font-medium">✨ {couponApplied} applied</span>
                    <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-300 font-medium tracking-wide uppercase">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Financial Math */}
              <div className="space-y-4 text-sm text-gray-400 font-light mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white font-medium">{shipping === 0 ? "Free" : formatINR(shipping)}</span>
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

              <div className="border-t border-gray-800 pt-6 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-3xl font-light text-white">{formatINR(total)}</span>
                </div>
                {subtotal < 1000 && (
                  <p className="text-xs text-emerald-500/80 mt-2 text-right">
                    Add {formatINR(1000 - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <Link
                href="/checkout"
                className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl text-sm font-bold tracking-[0.15em] uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 text-center block"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}