"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null); // Track which item is being removed

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/users/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) setCartItems(data.cart);
    } catch (err) {
      console.error("Server error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Handle Removing an Item
  const handleRemove = async (cartItemId) => {
    setRemoving(cartItemId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/users/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Remove from local state instantly for snappy UI
        setCartItems(cartItems.filter(item => item._id !== cartItemId));
        window.dispatchEvent(new Event("cartUpdated")); // Update Navbar count
      } else {
        alert("Failed to remove item");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.productId) {
        return total + (item.productId.price * item.quantity);
      }
      return total;
    }, 0);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center tracking-widest text-sm uppercase">Loading bag...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-white mb-8 tracking-wide">Your Shopping Bag</h1>

        {cartItems.length === 0 ? (
          <div className="bg-[#111] border border-white/5 p-12 rounded-2xl text-center">
            <svg className="w-16 h-16 text-gray-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-400 mb-8 text-lg font-light">Your bag is currently empty.</p>
            <Link href="/" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-emerald-500 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <ul className="divide-y divide-gray-800">
              {cartItems.map((item) => {
                const product = item.productId;
                if (!product) return null;

                return (
                  <li key={item._id} className="p-6 sm:p-8 flex items-center gap-6 group">
                    {/* Product Image */}
                    <Link href={`/product/${product._id}`} className="block h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-900 border border-gray-800 relative cursor-pointer">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-gray-600">No Image</div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-emerald-400 tracking-widest uppercase mb-1">{product.category}</p>
                          <Link href={`/product/${product._id}`} className="text-lg font-medium text-white hover:text-emerald-400 transition-colors line-clamp-1">
                            {product.name}
                          </Link>
                          {/* 🎨 NEW: Display Size and Color */}
                          <div className="mt-2 text-sm text-gray-400 font-light flex items-center gap-4">
                            {item.size && <span>Size: <strong className="text-gray-200">{item.size}</strong></span>}
                            {item.color && (
                              <span className="flex items-center gap-2">
                                Color: 
                                <span className="w-3 h-3 rounded-full border border-gray-600 inline-block" style={{ backgroundColor: item.color }}></span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemove(item._id)}
                          disabled={removing === item._id}
                          className="text-gray-600 hover:text-red-500 transition-colors p-2 disabled:opacity-50"
                          title="Remove item"
                        >
                          {removing === item._id ? (
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>Qty:</span>
                          <span className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-800 rounded text-gray-300">{item.quantity}</span>
                        </div>
                        <p className="text-xl font-medium text-white">₹{(product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Checkout Section */}
            <div className="border-t border-gray-800 p-6 sm:p-8 bg-gray-900/30">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-gray-400 font-light mb-1">Subtotal</p>
                  <p className="text-xs text-gray-500">Shipping calculated at checkout.</p>
                </div>
                <p className="text-3xl font-light text-white">₹{calculateTotal().toLocaleString()}</p>
              </div>
              <button className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl text-sm font-bold tracking-[0.15em] uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}