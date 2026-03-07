"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Package, Truck, MapPin, Calendar, CheckCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
};

const getStatusStyles = (status) => {
  switch (status) {
    case "Delivered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Shipped": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "Processing":
    case "Confirmed": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Cancelled": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

// Helper for the visual progress bar
const getProgressWidth = (status) => {
  if (status === "Pending") return "25%";
  if (status === "Confirmed" || status === "Processing") return "50%";
  if (status === "Shipped") return "75%";
  if (status === "Delivered") return "100%";
  return "0%"; // Cancelled
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs animate-pulse">Locating your packages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2">Order History</h1>
            <p className="text-gray-500 font-light">Manage and track your recent purchases.</p>
          </div>
          <Link href="/" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-[#111] border border-white/5 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-[#0a0a0a] border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 mb-8 text-lg font-light">You haven't placed any orders yet.</p>
            <Link href="/" className="bg-emerald-600 px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Order Header */}
                <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-5 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-8 text-xs uppercase tracking-widest text-gray-500 font-bold">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <div>
                        <p className="mb-0.5 text-[9px] opacity-60">Placed On</p>
                        <p className="text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[9px] opacity-60">Total Value</p>
                      <p className="text-white">{formatINR(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[9px] opacity-60">Ticket #</p>
                      <p className="text-emerald-400 font-mono">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.orderStatus)}`}>
                    {order.orderStatus}
                  </div>
                </div>

                <div className="p-6 sm:p-8 grid lg:grid-cols-3 gap-8">
                  
                  {/* Left: Product List */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">Items in this shipment</h4>
                    {order.products.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-[#0a0a0a] p-3 rounded-2xl border border-white/5">
                        <div className="w-16 h-20 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-700" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-white truncate mb-1">{item.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                            <span>Qty: {item.quantity}</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span>{formatINR(item.price)}</span>
                            {item.size && (
                              <>
                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                <span>Size: {item.size}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Tracking & Shipping Logic */}
                  <div className="space-y-6">
                    {/* Visual Progress Bar */}
                    <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Tracking Status</h4>
                      
                      {order.orderStatus !== "Cancelled" ? (
                        <div className="relative pt-2 pb-4">
                          <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-gray-800">
                            <div style={{ width: getProgressWidth(order.orderStatus) }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000"></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold tracking-widest uppercase text-gray-500">
                            <span className={order.orderStatus !== "Cancelled" ? "text-white" : ""}>Prep</span>
                            <span className={order.orderStatus === "Shipped" || order.orderStatus === "Delivered" ? "text-emerald-400" : ""}>Transit</span>
                            <span className={order.orderStatus === "Delivered" ? "text-emerald-400" : ""}>Arrived</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-rose-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 py-2">
                           Order Cancelled
                        </div>
                      )}

                      {/* Courier Info */}
                      {(order.orderStatus === "Shipped" || order.orderStatus === "Delivered") && (
                        <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-500 flex items-center gap-2"><Truck size={14}/> Courier</span>
                            <span className="text-white">{order.courierName || "Standard Ground"}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-500 flex items-center gap-2"><MapPin size={14}/> Waybill</span>
                            <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{order.trackingNumber || "Pending"}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Shipping Destination</h4>
                      <p className="text-sm text-gray-300 font-light leading-relaxed">
                        {order.shippingAddress.street}<br/>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}