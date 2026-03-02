"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Khadi Kurta", "Woven Cotton Kurta", "Nehru Jacket (Khadi)", "Khadi Shirts", "Handloom Jackets", "Pathani Suit", "Kurta Pajama Sets", "Casual Ethnic Wear",
  "Khadi Sarees", "Handwoven Sarees", "Khadi Kurtis", "Suit Sets (Handloom)", "Dupattas (Khadi / Cotton)", "Ethnic Gowns", "Co-ord Sets", "Festive Wear",
  "Unisex Kurtas", "Khadi Shawls", "Stoles", "Scarves", "Sustainable Basics", "Organic Cotton Wear", "Gamcha",
  "Pure Khadi", "Handloom Cotton", "Linen Blend", "Ikat", "Muslin", "Jamdani", "Chanderi", "Organic Cotton",
  "Daily Wear", "Office Wear", "Festive Collection", "Wedding Collection", "Summer Collection", "Winter Khadi Wear",
  "Khadi Bags", "Potli Bags", "Footwear", "Handmade Belts", "Fabric Jewelry"
];

export default function SellerDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem("sellerToken");
    
    if (!token) {
      router.replace("/seller/login"); 
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", brand: "", description: "", category: "", fabricType: "", color: "", pattern: "", size: "", price: "", discountPrice: "", stock: "", imageUrl: "", materialOrigin: "", handwoven: true, isFeatured: false, tags: "" 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formattedData = {
      ...formData,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      stock: Number(formData.stock),
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      images: [{ url: formData.imageUrl }]
    };

    try {
      const token = localStorage.getItem("sellerToken");
      
      const res = await fetch("http://localhost:5000/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: "", brand: "", description: "", category: "", fabricType: "", color: "", pattern: "", size: "", price: "", discountPrice: "", stock: "", imageUrl: "", materialOrigin: "", handwoven: true, isFeatured: false, tags: ""
        });
        window.scrollTo(0,0);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add product");
      }
    } catch (err) {
      alert("Server Error. Check terminal.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    router.push("/seller/login");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-emerald-500 flex items-center justify-center tracking-[0.3em] text-xs uppercase font-bold">
        Verifying Secure Access...
      </div>
    );
  }

  
  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      
      
      <nav className="h-16 border-b border-white/5 bg-[#111] flex items-center justify-between px-6 sticky top-0 z-50">
        
        {/* Left: Logout Button */}
        <button 
          onClick={handleLogout} 
          className="text-xs font-bold tracking-[0.2em] text-red-400 hover:text-red-300 uppercase transition-colors flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* Center: Centered KAYA Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/seller" className="text-2xl font-bold tracking-widest cursor-pointer">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">KAYA</span>
          </Link>
        </div>

        {/* Right: Kaya Seller Badge */}
        <div className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2">
          <span className="hidden sm:inline">Kaya</span> 
          <span className="text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">Seller</span>
        </div>
      </nav>

      {/* Main Dashboard Layout (Sidebar + Form) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Cleaned Up Sidebar */}
        <div className="w-64 bg-[#111] border-r border-white/5 p-6 hidden md:block">
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-6 font-bold">Dashboard Menu</p>
          <nav className="space-y-2">
            <Link href="/seller" className="block px-4 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium border border-emerald-500/20 transition-colors">
              Add Product
            </Link>
            <Link href="/seller/products" className="block px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
              Manage Inventory
            </Link>
            <Link href="/seller/orders" className="block px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
              View Orders
            </Link>
          </nav>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-light mb-2">Add New Product</h1>
            <p className="text-gray-500 text-sm mb-10">Upload a new item to your factory inventory.</p>

            {success && (
              <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Product added successfully to database!
              </div>
            )}

            <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-8 bg-[#111] border border-white/5 p-8 rounded-2xl shadow-2xl">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Product Name *</label>
                  <input suppressHydrationWarning required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Product Name" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Brand</label>
                  <input suppressHydrationWarning type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Kaya" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Category *</label>
                  <input 
                    suppressHydrationWarning
                    required 
                    list="category-options" 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" 
                    placeholder="Start typing..." 
                  />
                  <datalist id="category-options">
                    {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Fabric Type *</label>
                  <input suppressHydrationWarning required type="text" name="fabricType" value={formData.fabricType} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Cotton/Synthetic Blend" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Pattern</label>
                  <input suppressHydrationWarning type="text" name="pattern" value={formData.pattern} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Plain, Checked..." />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Material Origin</label>
                  <input suppressHydrationWarning type="text" name="materialOrigin" value={formData.materialOrigin} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. Varanasi" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Specific Color *</label>
                  <input suppressHydrationWarning required type="text" name="color" value={formData.color} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="White, Red..." />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Size / Length</label>
                  <input suppressHydrationWarning type="text" name="size" value={formData.size} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="L, 38, or 2.5 Meters" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Price (₹) *</label>
                  <input suppressHydrationWarning required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="1200" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Discount Price (₹)</label>
                  <input suppressHydrationWarning type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="999" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Stock *</label>
                  <input suppressHydrationWarning required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="100" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input suppressHydrationWarning type="checkbox" name="handwoven" checked={formData.handwoven} onChange={handleChange} className="w-5 h-5 accent-emerald-500" />
                    <span className="text-sm text-gray-300">Handwoven</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input suppressHydrationWarning type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 accent-emerald-500" />
                    <span className="text-sm text-gray-300">Feature on Homepage</span>
                  </label>
                </div>
                <div>
                  <input suppressHydrationWarning type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-transparent border-b border-gray-600 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none text-sm" placeholder="Tags: premium, summer, sale..." />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Image URL *</label>
                <input suppressHydrationWarning required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Description *</label>
                <textarea suppressHydrationWarning required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Describe the item..."></textarea>
              </div>

              <button suppressHydrationWarning disabled={loading} type="submit" className="w-full bg-emerald-600 text-white font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50">
                {loading ? "Saving Product..." : "Publish Product"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}