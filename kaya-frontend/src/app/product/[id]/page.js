"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeAccordion, setActiveAccordion] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product);
          if (data.product.colors && data.product.colors.length > 0) {
            setSelectedColor(data.product.colors[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToBag = async () => {
    if (!selectedSize) {
      showToastMessage("Please select a size first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToastMessage("Please login to add items to bag");
      router.push("/login");
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("http://localhost:5000/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, quantity: 1, size: selectedSize, color: selectedColor })
      });

      if (res.ok) {
        showToastMessage("Added to bag successfully!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        const data = await res.json();
        showToastMessage(data.message || "Failed to add to bag");
      }
    } catch (err) {
      showToastMessage("Server error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return <LoadingSkeleton />;
  if (!product) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast Notification */}
      <div className={`fixed top-24 right-6 z-50 transform transition-all duration-300 ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-emerald-900/50 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/" className="hover:text-white transition-colors">{product.category || 'Shop'}</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          <div className="w-full lg:w-[40%] space-y-4 lg:sticky lg:top-28">
                        
            <div className="relative overflow-hidden bg-[#111] border border-white/5 aspect-[4/5] rounded-2xl group cursor-zoom-in">
              {product.images && product.images[selectedImage] ? (
                <div className="w-full h-full overflow-hidden">
                  <img 
                    src={product.images[selectedImage].url} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-150 origin-center"
                    alt={product.name}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">No Image</div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 bg-white text-black text-xs font-bold tracking-wider uppercase rounded-full">
                    New Arrival
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === idx ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt={`View ${idx}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[60%] flex flex-col">
            
            <div className="mb-2">
              <span className="text-emerald-400 text-xs tracking-[0.3em] uppercase font-medium">
                {product.brand || 'Kaya Exclusive'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-white leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-medium text-white">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase rounded-full">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-10 font-light border-l-2 border-emerald-500/30 pl-4">
              {product.description || "Premium quality product crafted with attention to detail. Designed for comfort and style that lasts."}
            </p>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs tracking-widest font-bold text-gray-300 uppercase">
                    Color: <span className="text-white font-normal">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-gray-700 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs tracking-widest font-bold text-gray-300 uppercase">
                  Select Size: <span className="text-white font-normal">{selectedSize}</span>
                </span>
                <button className="text-gray-500 text-xs hover:text-white underline transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border flex items-center justify-center text-sm font-medium transition-all duration-300 rounded-lg
                      ${selectedSize === size 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                        : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <button 
                onClick={handleAddToBag}
                disabled={adding}
                className="flex-1 bg-white text-black py-4 px-8 font-bold tracking-[0.15em] text-sm uppercase hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
              >
                {adding ? "Adding..." : "Add to Bag"}
              </button>
              <button className="w-16 h-16 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all duration-300 rounded-xl group bg-[#111]">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Accordion Details */}
            <div className="border-t border-gray-800">
              <Accordion 
                title="Description" 
                isOpen={activeAccordion === "description"} 
                onClick={() => setActiveAccordion("description")}
              >
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {product.fullDescription || product.description || "This premium product is crafted with the finest materials to ensure both comfort and durability. Perfect for any occasion."}
                </p>
              </Accordion>
              
              <Accordion 
                title="Material & Care" 
                isOpen={activeAccordion === "material"} 
                onClick={() => setActiveAccordion("material")}
              >
                <ul className="text-gray-400 text-sm space-y-2 font-light">
                  <li>• 100% Premium Quality Material</li>
                  <li>• Machine wash cold</li>
                  <li>• Do not bleach</li>
                  <li>• Iron on low heat</li>
                </ul>
              </Accordion>
              
              <Accordion 
                title="Shipping & Returns" 
                isOpen={activeAccordion === "shipping"} 
                onClick={() => setActiveAccordion("shipping")}
              >
                <ul className="text-gray-400 text-sm space-y-2 font-light">
                  <li>• Free shipping on orders above ₹999</li>
                  <li>• COD available</li>
                  <li>• 7-day easy return policy</li>
                  <li>• Express delivery in 2-4 business days</li>
                </ul>
              </Accordion>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts category={product.category} currentId={product._id} />
      </div>
    </div>
  );
}

// Reusable Components
function Accordion({ title, children, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-800">
      <button 
        onClick={onClick}
        className="w-full py-5 flex justify-between items-center text-left group"
      >
        <span className="text-sm tracking-wider font-medium text-gray-300 group-hover:text-white transition-colors">
          {title}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-xs tracking-widest uppercase animate-pulse">Loading Product...</span>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-light mb-4">Product Not Found</h2>
      <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">Return to Shop</Link>
    </div>
  );
}

function RelatedProducts({ category, currentId }) {
  return (
    <div className="mt-24">
      <h3 className="text-2xl font-light mb-8 flex items-center gap-4">
        You Might Also Like
        <span className="h-px flex-1 bg-gray-800"></span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="group cursor-pointer">
            <div className="aspect-[3/4] bg-[#111] border border-white/5 rounded-xl mb-4 overflow-hidden">
              <div className="w-full h-full bg-gray-900 group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h4 className="text-sm text-gray-300 group-hover:text-white transition-colors">Similar Product</h4>
            <p className="text-sm text-gray-500 mt-1">₹1,299</p>
          </div>
        ))}
      </div>
    </div>
  );
}