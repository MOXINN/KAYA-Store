"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Store, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  ArrowRight 
} from "lucide-react";

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

  // If already logged in as an owner, redirect to dashboard
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/owners/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Shop registered successfully! Welcome to Kaya.");
        
        // Give them 1.5 seconds to read the success message
        setTimeout(() => {
          router.push("/seller/login");
        }, 1500);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Is your server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full bg-[#111] border border-white/5 rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-emerald-500/10 w-14 h-14 rounded-2xl border border-emerald-500/20 mb-6 group hover:bg-emerald-500/20 transition-colors">
             <Store size={28} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Partner with <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Kaya</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase font-medium">Create your seller portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Owner Name *</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="Full Name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Shop Name *</label>
              <div className="relative group">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
                <input required type="text" name="shopName" value={formData.shopName} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="e.g. Kaya Handlooms" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Business Email *</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="seller@kaya.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Secure Password *</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="Minimum 6 characters" minLength={6} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
            <div className="space-y-1.5 mt-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Phone Number</label>
              <div className="relative group">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" placeholder="+91..." />
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">GST Number</label>
              <div className="relative group">
                <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none uppercase placeholder:normal-case" placeholder="Optional" />
              </div>
            </div>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-emerald-600 text-white font-bold tracking-[0.2em] uppercase py-4 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 mt-6 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
          >
            {loading ? "Creating Portal..." : (
              <>Register Business <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Already a registered seller? <Link href="/seller/login" className="text-emerald-400 hover:text-emerald-300 transition-colors ml-1 border-b border-transparent hover:border-emerald-400 pb-0.5">Access Dashboard</Link>
          </p>
        </div>

      </div>
    </div>
  );
}