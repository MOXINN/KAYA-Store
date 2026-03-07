"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";

// --- HELPER ---
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ManageInventory() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/products`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || data);
      } else {
        toast.error("Failed to load inventory data");
      }
    } catch (error) {
      toast.error("Network error while fetching products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(product => product._id !== id));
        toast.success("Product removed from inventory");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Server error during deletion");
    }
  };

  // Memoized Search & Filter
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => categoryFilter === "All" || product.category === categoryFilter)
      .filter(product => 
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.fabricType?.toLowerCase().includes(search.toLowerCase())
      );
  }, [products, search, categoryFilter]);

  // Extract unique categories for the filter dropdown
  const uniqueCategories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)];
  }, [products]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light mb-2">Inventory Ledger</h1>
          <p className="text-gray-500 font-light text-sm">Manage all active listings, pricing, and stock levels.</p>
        </div>
        <Link 
          href="/seller/add-product" 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 shrink-0 hover:-translate-y-0.5"
        >
          <PlusCircle size={16} /> New Item
        </Link>
      </div>

      {/* CONTROLS & TABLE WRAPPER */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-white/5 bg-[#111] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              {filteredProducts.length} Items
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Search fabrics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-black border border-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white"
              />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-48 bg-black border border-gray-800 rounded-xl pl-11 pr-8 py-2.5 text-sm appearance-none focus:outline-none focus:border-emerald-500 transition-all text-white cursor-pointer"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-[#0a0a0a] border-b border-white/5">
                <th className="p-6 font-medium">Product Item</th>
                <th className="p-6 font-medium">Category</th>
                <th className="p-6 font-medium">Stock Level</th>
                <th className="p-6 font-medium">Price</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#111]">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group">
                  
                  {/* Item Image & Name */}
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0 relative group-hover:border-emerald-500/30 transition-colors">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-[10px] tracking-widest uppercase text-gray-500 mt-1">
                          {product.fabricType || "Standard Weave"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-6 text-sm text-gray-400">
                    {product.category}
                  </td>

                  {/* Stock Level with Warning Logic */}
                  <td className="p-6">
                    {product.stock <= 5 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full border bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse">
                        <AlertCircle size={12} /> {product.stock} Left
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {product.stock} Units
                      </span>
                    )}
                  </td>

                  {/* Pricing */}
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{formatINR(product.price)}</span>
                      {product.discountPrice && (
                        <span className="text-[10px] text-gray-500 line-through mt-0.5">{formatINR(product.discountPrice)}</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => toast("Edit feature coming soon!")} 
                        className="p-2.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id, product.name)} 
                        className="p-2.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-xs tracking-widest uppercase font-bold">No products found.</p>
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