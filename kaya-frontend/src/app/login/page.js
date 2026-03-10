"use client";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  
  // State for form fields
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "" 
  });
  
  // State for UI feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle typing in input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Use the live URL if available, otherwise use localhost for local testing
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Save Token
        localStorage.setItem("token", data.token);

       localStorage.setItem("token", data.token);
  toast.success("Welcome back!");
  router.push("/profile");

        
        
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Sign in to Kaya Collections</p>

        {/* Error Message Banner */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="email@example.com"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">Password</label>
            </div>
            <input
              type="password"
              name="password"
              required
              className=" w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="password"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          New to Kaya?{" "}
          <Link href="/register" className="text-green-700 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}