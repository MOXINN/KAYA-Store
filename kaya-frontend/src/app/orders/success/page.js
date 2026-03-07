"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setOrderId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-[#111] border border-white/5 p-10 rounded-3xl shadow-2xl text-center relative z-10 animate-in zoom-in-95 duration-500">
        
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle size={48} className="text-emerald-500" />
        </div>

        <h1 className="text-3xl font-light tracking-wide mb-3">Order Confirmed</h1>
        <p className="text-gray-400 font-light mb-8 text-sm">
          Thank you for choosing authentic handlooms. We are preparing your items for shipment.
        </p>

        {orderId && (
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Your Ticket Number</p>
            <p className="text-2xl font-mono text-emerald-400 tracking-wider bg-emerald-500/5 py-2 rounded-xl border border-emerald-500/10">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link 
            href="/orders" 
            className="w-full px-6 py-4 bg-emerald-600 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            Track My Order <ArrowRight size={16} />
          </Link>
          <Link 
            href="/" 
            className="w-full px-6 py-4 bg-[#0a0a0a] border border-gray-800 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white/5 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}