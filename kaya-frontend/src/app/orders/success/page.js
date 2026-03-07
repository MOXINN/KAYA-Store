"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

// logic component
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setOrderId(id);
  }, [searchParams]);

  return (
    <div className="max-w-md w-full bg-[#111] border border-white/5 p-10 rounded-3xl shadow-2xl text-center relative z-10 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <CheckCircle size={48} className="text-emerald-500" />
      </div>
      <h1 className="text-3xl font-light tracking-wide mb-3 text-white">Order Confirmed</h1>
      <p className="text-gray-400 font-light mb-8 text-sm">Thank you for choosing KAYA.</p>

      {orderId && (
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Order ID</p>
          <p className="text-emerald-400 font-mono">{orderId}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link href="/orders" className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl text-xs font-bold tracking-widest uppercase">Track My Order</Link>
        <Link href="/" className="text-gray-400 text-xs uppercase tracking-widest py-2">Back to Shop</Link>
      </div>
    </div>
  );
}

// THE MAIN EXPORT MUST BE PURELY WRAPPED
export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-emerald-500 animate-pulse">Loading...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}