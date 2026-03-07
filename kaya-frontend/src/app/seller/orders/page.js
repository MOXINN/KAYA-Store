"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  MoreHorizontal
} from "lucide-react";

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

const getStatusIcon = (status) => {
  switch (status) {
    case "Pending": return <Clock size={12} className="mr-1 inline" />;
    case "Confirmed": return <Package size={12} className="mr-1 inline" />;
    case "Shipped": return <Truck size={12} className="mr-1 inline" />;
    case "Delivered": return <CheckCircle size={12} className="mr-1 inline" />;
    case "Cancelled": return <XCircle size={12} className="mr-1 inline" />;
    default: return null;
  }
};

export default function ManageOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("ownerToken");
    if (!token) {
      router.push("/seller/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
      } else {
        toast.error("Unauthorized access to orders");
        router.push("/seller/login");
      }
    } catch (err) {
      toast.error("Server connection failed");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const token = localStorage.getItem("ownerToken");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (res.ok) {
        toast.success(`Order #${orderId.slice(-6)} moved to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Update request failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // Memoized Search & Filter Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => filterStatus === "All" || order.orderStatus === filterStatus)
      .filter(order =>
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        order.shippingAddress?.city?.toLowerCase().includes(search.toLowerCase())
      );
  }, [orders, filterStatus, search]);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Fulfillment Data...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light mb-2">Order Management</h1>
          <p className="text-gray-500 font-light text-sm">Process, track, and update customer purchases.</p>
        </div>
      </div>

      {/* MAIN DATA TABLE WRAPPER */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Toolbar: Search & Filters */}
        <div className="p-6 border-b border-white/5 bg-[#111] flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> {filteredOrders.length} Records
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Search ticket, name, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 bg-black border border-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white placeholder:text-gray-600"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-48 bg-black border border-gray-800 rounded-xl pl-11 pr-8 py-2.5 text-sm appearance-none focus:outline-none focus:border-emerald-500 transition-all text-white cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-[#0a0a0a] border-b border-white/5">
                <th className="p-6 font-medium">Ticket / Date</th>
                <th className="p-6 font-medium">Customer Details</th>
                <th className="p-6 font-medium">Items</th>
                <th className="p-6 font-medium">Total Value</th>
                <th className="p-6 font-medium">Fulfillment Stage</th>
                <th className="p-6 font-medium text-right">Processing</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5 bg-[#111]">
              {filteredOrders.map((order) => (
                <tr key={order._id} className={`group transition-all ${updatingId === order._id ? "opacity-40 pointer-events-none" : "hover:bg-white/[0.02]"}`}>
                  
                  {/* Column 1: Ticket & Date */}
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-emerald-500 font-mono text-xs font-bold bg-emerald-500/5 px-2 py-1 rounded w-max border border-emerald-500/10 mb-1.5">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>

                  {/* Column 2: Customer */}
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{order.user?.fullname || "Guest Purchase"}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Items Mini-Preview */}
                  <td className="p-6">
                    <div className="flex items-center -space-x-2">
                      {order.products?.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-900 overflow-hidden relative group-hover:border-white/[0.02] transition-colors" title={item.name}>
                          {item.image ? (
                            <img src={item.image} className="w-full h-full object-cover" alt="thumb" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600"><Package size={12}/></div>
                          )}
                        </div>
                      ))}
                      {order.products?.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-[#111] bg-emerald-900 flex items-center justify-center text-[10px] font-bold text-white z-10">
                          +{order.products.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-2">
                      {order.products?.reduce((acc, curr) => acc + curr.quantity, 0)} Units Total
                    </p>
                  </td>

                  {/* Column 4: Value */}
                  <td className="p-6 font-medium text-sm text-white">
                    {formatINR(order.totalAmount)}
                  </td>

                  {/* Column 5: Status Badge */}
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap inline-flex items-center ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus}
                    </span>
                  </td>

                  {/* Column 6: Actions */}
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      
                      {/* Status Update Dropdown */}
                      <div className="relative group/select">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="appearance-none bg-[#0a0a0a] border border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-300 py-2 pl-3 pr-8 rounded-lg outline-none focus:border-emerald-500 hover:border-gray-600 transition-all cursor-pointer"
                        >
                          <option value="Pending">Set: Pending</option>
                          <option value="Confirmed">Set: Confirmed</option>
                          <option value="Shipped">Set: Shipped</option>
                          <option value="Delivered">Set: Delivered</option>
                          <option value="Cancelled">Set: Cancelled</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <MoreHorizontal size={14} />
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Link 
                        href={`/seller/orders/${order._id}`}
                        className="p-2 bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 rounded-lg transition-all"
                        title="View Full Details"
                      >
                        <ExternalLink size={16} />
                      </Link>

                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty State */}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-24 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-xs tracking-widest uppercase font-bold">No orders match your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}