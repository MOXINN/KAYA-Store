"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    shopName: "",
    phone: "",
    gstNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:5000/owners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message); // "Owner registered successfully! Please log in."
        setTimeout(() => {
          router.push("/seller/login");
        }, 2000); // Redirect to login after 2 seconds
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
            Kaya Seller.
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Create Owner Account</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}
        {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-6 text-center">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Full Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Enter your name" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Shop Name *</label>
            <input required type="text" name="shopName" value={formData.shopName} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. Kaya" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Email Address *</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Seller@kaya.com" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Password *</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="••••••••" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="+91..." />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">GST Number</label>
              <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="GST" />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 mt-4">
            {loading ? "Creating..." : "Register Shop"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already registered? <Link href="/seller/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Login here</Link>
        </p>
      </div>
    </div>
  );
}