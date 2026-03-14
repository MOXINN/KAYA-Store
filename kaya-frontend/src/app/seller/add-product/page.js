"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Tag,
  ChevronDown
} from "lucide-react";

// NEW GROUPED CATEGORIES
const CATEGORIES = {
  "Men's": ["Khadi Kurta", "Woven Cotton Kurta", "Nehru Jacket", "Khadi Shirts", "Handloom Jackets", "Pathani Suit", "Kurta Pajama Set", "Casual Ethnic Wear", "Wedding Collection"],
  "Women's": ["Khadi Sarees", "Handwoven Sarees", "Khadi Kurti", "Suit Sets (Handloom)", "Dupattas (Khadi / Cotton)", "Ethnic Gowns", "Co-ord Sets", "Festive Wear", "Anarkali Kurti", "Dupatta", "Lehenga Choli"],
  "Unisex & Sustainable": ["Unisex Kurtas", "Khadi Shawls", "Stoles", "Scarves", "Sustainable Basics", "Organic Cotton Wear", "Gamcha", "Stoles & Dupattas"],
  "Fabrics": ["Raw Khadi Fabric", "Handloom Cotton", "Linen Blend", "Ikat", "Muslin", "Jamdani", "Chanderi Fabric", "Organic Cotton"],
  "Occasions": ["Daily Wear", "Office Wear", "Festive Collection", "Wedding Collection", "Summer Collection", "Winter Khadi Wear"],
  "Accessories": ["Khadi Bags", "Potli Bags", "Footwear", "Handmade Belts", "Fabric Jewelry", "Bags"],
  "Kids": ["Kids Ethnic Wear"]
};

export default function AddProduct() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("ownerToken"); 
    
    if (!token) {
      router.replace("/seller/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const initialState = {
    name: "",
    brand: "Kaya Handlooms",
    description: "",
    category: "",
    fabricType: "",
    color: "",
    pattern: "",
    size: "",
    price: "",
    discountPrice: "",
    stock: "",
    imageUrl: "",
    materialOrigin: "Kalpi, UP",
    handwoven: true,
    isFeatured: false,
    tags: ""
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue
    });

    if (name === "imageUrl") setImagePreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (formData.discountPrice && Number(formData.discountPrice) >= Number(formData.price)) {
      toast.error("Discount price must be lower than selling price");
      return;
    }

    if (formData.price < 0 || formData.stock < 0) {
      toast.error("Price and stock cannot be negative");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("ownerToken");

      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock),
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : []
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create product");
        return;
      }

      toast.success("Product published successfully");

      setFormData(initialState);
      setImagePreview("");

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-light mb-2">Publish Product</h1>
            <p className="text-gray-500 text-sm">
              Upload a new item directly to your live store inventory.
            </p>
          </div>

          <Link
            href="/seller"
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* BASIC INFO */}
          <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-xl">
            <h2 className="text-lg text-emerald-400 flex items-center gap-2 mb-6">
              <Layers size={18} />
              Basic Information
            </h2>

            <div className="space-y-6">
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
              />

              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Product Description"
                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
              />

              {/* NEW GROUPED DROPDOWN */}
              <div className="relative">
                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 appearance-none outline-none transition-colors text-white cursor-pointer"
                >
                  <option value="" disabled>Select Category</option>
                  {Object.entries(CATEGORIES).map(([group, items]) => (
                    <optgroup key={group} label={group} className="bg-gray-900 text-emerald-500 font-bold uppercase tracking-wider text-xs">
                      {items.map(item => (
                        <option key={item} value={item} className="text-white font-normal text-sm capitalize">
                          {item}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>

              {/* RE-ADDED MISSING FIELDS */}
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  required
                  name="fabricType"
                  value={formData.fabricType}
                  onChange={handleChange}
                  placeholder="Fabric Type (e.g., Pure Khadi, Muslin)"
                  className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
                />

                <input
                  required
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Color (e.g., Indigo, Off-White)"
                  className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
                />
              </div>

            </div>
          </div>

          {/* IMAGE */}
          <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-xl">
            <h2 className="text-lg text-emerald-400 flex items-center gap-2 mb-6">
              <ImageIcon size={18} />
              Product Image
            </h2>

            <div className="w-full h-52 bg-[#0a0a0a] border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview("")}
                />
              ) : (
                <ImageIcon size={40} className="text-gray-700" />
              )}
            </div>

            <input
              required
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Paste Image URL"
              className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
            />
          </div>

          {/* PRICING */}
          <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-xl">
            <h2 className="text-lg text-emerald-400 flex items-center gap-2 mb-6">
              <IndianRupee size={18} />
              Pricing & Stock
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Selling Price ₹"
                className="bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
              />

              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="Discount Price (Optional)"
                className="bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
              />

              <input
                required
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Total Stock"
                className="bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
              />
            </div>
          </div>

          {/* TAGS */}
          <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-xl">
            <h2 className="text-lg text-emerald-400 flex items-center gap-2 mb-6">
              <Tag size={18} />
              Search Tags
            </h2>

            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., summer, khadi, handwoven (comma separated)"
              className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-emerald-500 rounded-xl p-4 outline-none transition-colors"
            />
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            {loading ? "Publishing to Store..." : (
              <>
                <CheckCircle size={20} />
                Publish Product
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}