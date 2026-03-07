"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function SellerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Auto-redirect if the seller is already logged in
  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (token) {
      router.replace("/seller");
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/owners/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Securely store the OWNER token
        localStorage.setItem("ownerToken", data.token);
        
        toast.success("Authentication successful. Welcome to Seller Hub.");
        router.push("/seller"); // Route them directly to the Command Center
      } else {
        toast.error(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Glow for Luxury Feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-[2rem] shadow-2xl p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-emerald-500/10 w-16 h-16 rounded-2xl border border-emerald-500/20 mb-6 group">
             <ShieldCheck size={32} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2 text-white">
            Kaya <span className="font-bold text-emerald-500">Seller Hub</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase font-bold">Secure Admin Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Business Email</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" 
                placeholder="admin@kaya.com" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Secure Password</label>
              <button type="button" onClick={() => toast("Contact support to reset your password.")} className="text-[10px] text-emerald-500 hover:text-emerald-400 uppercase tracking-widest font-bold transition-colors">
                Recover
              </button>
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                required 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          {/* Submit Button with Loading State */}
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-emerald-600 text-white font-bold tracking-[0.2em] uppercase py-4 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-70 mt-6 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Access Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Don't have a seller account? <Link href="/seller/register" className="text-emerald-400 hover:text-emerald-300 transition-colors ml-1 border-b border-transparent hover:border-emerald-400 pb-0.5">Register your shop</Link>
          </p>
        </div>

      </div>
    </div>
  );
}