"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    // 1. Check if user is logged in
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login first to add items to your cart!");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 2. Send request to backend
      const res = await fetch("http://localhost:5000/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send the token for authMiddleware
        },
        body: JSON.stringify({ productId, quantity: 1 }) // Default quantity is 1
      });

      const data = await res.json();

      if (res.ok) {
        alert("Added to cart successfully!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert(data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition ${loading ? "opacity-50" : ""}`}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}