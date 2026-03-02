"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/owners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        //  Save the token securely for the Seller Dashboard to use
        localStorage.setItem("sellerToken", data.token);
        router.push("/seller"); 
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
            Kaya Seller.
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Secure Portal Access</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Seller Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="seller@kaya.com" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Password</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="••••••••" />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 mt-4">
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New seller? <Link href="/seller/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">Register here</Link>
        </p>
      </div>
    </div>
  );
}