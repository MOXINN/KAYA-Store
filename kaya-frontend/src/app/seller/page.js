"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { 
  IndianRupee, 
  Package, 
  Clock, 
  ArrowRight, 
  TrendingUp,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

// --- HELPERS ---
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status) => {
  switch (status) {
    case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Confirmed": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Shipped": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "Delivered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Cancelled": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

export default function DashboardHome() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("ownerToken");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        // Grab only the 5 most recent orders for the quick-view table
        setRecentOrders(data.orders.slice(0, 5));
        
        // Calculate metrics
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.count || 0,
          pendingOrders: data.orders.filter(o => ["Pending", "Confirmed", "Processing"].includes(o.orderStatus)).length
        });
      } else {
        toast.error("Failed to authenticate session.");
      }
    } catch (err) {
      toast.error("Failed to load live dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Live Data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-[#0a0a0a] border border-emerald-500/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-light mb-2">Welcome back to the Command Center.</h2>
          <p className="text-gray-400 font-light text-sm max-w-xl">
            Your Kaya Handlooms store is currently active. You have <span className="text-amber-500 font-medium">{stats.pendingOrders} orders</span> waiting for fulfillment today.
          </p>
        </div>
        <Link href="/seller/add-product" className="relative z-10 shrink-0 bg-white text-black font-bold tracking-widest uppercase text-xs px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-emerald-400 hover:shadow-emerald-500/20 transition-all hover:-translate-y-1">
          + Add New Item
        </Link>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
              <IndianRupee size={24} />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp size={12} /> Live
            </span>
          </div>
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">Net Revenue</p>
          <h3 className="text-4xl font-light tracking-tight text-white">{formatINR(stats.totalRevenue)}</h3>
        </div>

        {/* Total Orders Card */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">Lifetime Orders</p>
          <h3 className="text-4xl font-light tracking-tight text-white">{stats.totalOrders}</h3>
        </div>

        {/* Pending Actions Card */}
        <div className="bg-[#111] border border-amber-500/20 rounded-3xl p-8 hover:border-amber-500/50 transition-colors group relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            {stats.pendingOrders > 0 && (
              <span className="flex items-center gap-1 text-amber-500 text-xs font-bold animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">Pending Fulfillment</p>
            <h3 className="text-4xl font-light tracking-tight text-amber-500">{stats.pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* 3. RECENT ORDERS PREVIEW */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Table Header Area */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-[#111]">
          <div>
            <h3 className="text-xl font-medium">Latest Incoming Orders</h3>
            <p className="text-xs text-gray-500 mt-1">Showing your 5 most recent transactions.</p>
          </div>
          <Link href="/seller/orders" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors group">
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 bg-[#0a0a0a]">
                <th className="p-6 font-medium">Ticket #</th>
                <th className="p-6 font-medium">Customer</th>
                <th className="p-6 font-medium">Date</th>
                <th className="p-6 font-medium">Value</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#111]">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <span className="text-emerald-500 font-mono text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-medium text-white">{order.user?.fullname || "Guest Checkout"}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{order.shippingAddress?.city}</p>
                  </td>
                  <td className="p-6 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-6 font-medium text-sm text-white">
                    {formatINR(order.totalAmount)}
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Link href={`/seller/orders/${order._id}`} className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                      <ExternalLink size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-xs tracking-widest uppercase font-bold">No orders received yet.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}