"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORY_STRUCTURE = {
  "Men's": ["Khadi Kurta", "Woven Cotton Kurta", "Nehru Jacket (Khadi)", "Khadi Shirts", "Handloom Jackets", "Pathani Suit", "Kurta Pajama Sets", "Casual Ethnic Wear"],
  "Women's": ["Khadi Sarees", "Handwoven Sarees", "Khadi Kurtis", "Suit Sets (Handloom)", "Dupattas (Khadi / Cotton)", "Ethnic Gowns", "Co-ord Sets", "Festive Wear"],
  "Unisex & Sustainable": ["Unisex Kurtas", "Khadi Shawls", "Stoles", "Scarves", "Sustainable Basics", "Organic Cotton Wear", "Gamcha"],
  "Fabrics": ["Pure Khadi", "Handloom Cotton", "Linen Blend", "Ikat", "Muslin", "Jamdani", "Chanderi", "Organic Cotton"],
  "Occasions": ["Daily Wear", "Office Wear", "Festive Collection", "Wedding Collection", "Summer Collection", "Winter Khadi Wear"],
  "Accessories": ["Khadi Bags", "Potli Bags", "Footwear", "Handmade Belts", "Fabric Jewelry"]
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeParent, setActiveParent] = useState("All");
  const [activeSub, setActiveSub] = useState("All");


  
useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products`, // Removed the /api
          {
            headers: {
              "ngrok-skip-browser-warning": "any-value", // This tells ngrok to give us the JSON, not the warning page!
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || data);
        } else {
          console.error("Server Error:", data);
        }

      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeParent === "All") return true; // Show everything

    const validSubCategories = CATEGORY_STRUCTURE[activeParent] || [];
    
    if (activeSub === "All") {
      // If "Men's" is clicked but no sub-category is chosen, show ALL Men's products
      return validSubCategories.includes(p.category);
    } else {
      // Show exact match (e.g., ONLY "Nehru Jacket (Khadi)")
      return p.category === activeSub;
    }
  });

  const handleParentClick = (parent) => {
    setActiveParent(parent);
    setActiveSub("All"); // Reset sub-category when parent changes
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center tracking-widest text-sm uppercase">Loading Collection...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1605001007823-774f35832049?q=80&w=2070&auto=format&fit=crop')] bg-fixed bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <p className="text-emerald-400 text-sm tracking-[0.4em] uppercase font-medium mb-6 animate-fade-in-up">Authentic Handlooms</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-8 text-white">
            Woven in <span className="italic text-gray-400">Tradition.</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            Discover our curated selection of premium Khadi and Summer Cool fabrics. Crafted with precision directly from our factory in Kalpi.
          </p>
          <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="inline-block px-10 py-4 bg-white text-black text-sm font-bold tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-all duration-500 rounded-full">
            Explore Collection
          </button>
        </div>
      </div>

      {/* 2. FEATURES LIST SECTION */}
      <div className="border-y border-white/5 bg-[#0f0f0f]">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-6">
              <span className="text-3xl mb-4 block">🧵</span>
              <h3 className="text-lg font-medium text-white mb-2 tracking-wide">100% Authentic Khadi</h3>
              <p className="text-gray-500 text-sm font-light">Sourced and manufactured directly in our Kalpi handloom factory.</p>
            </div>
            <div className="p-6">
              <span className="text-3xl mb-4 block">🚚</span>
              <h3 className="text-lg font-medium text-white mb-2 tracking-wide">Nationwide Shipping</h3>
              <p className="text-gray-500 text-sm font-light">Fast, reliable delivery straight to your doorstep across India.</p>
            </div>
            <div className="p-6">
              <span className="text-3xl mb-4 block">✨</span>
              <h3 className="text-lg font-medium text-white mb-2 tracking-wide">Premium Quality</h3>
              <p className="text-gray-500 text-sm font-light">Every garment and fabric roll passes rigorous quality checks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ECOMMERCE PRODUCTS SECTION (WITH NEW TWO-TIER FILTER) */}
      <div id="shop" className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex flex-col mb-12 gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-2">Our Collections</h2>
              <p className="text-gray-500 text-sm tracking-widest uppercase">Direct from the looms</p>
            </div>
            <p className="text-sm text-gray-500 border border-gray-800 px-4 py-2 rounded-full hidden md:block">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> items
            </p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 border-b border-gray-800">
            {['All', ...Object.keys(CATEGORY_STRUCTURE)].map((parent) => (
              <button
                key={parent}
                suppressHydrationWarning
                onClick={() => handleParentClick(parent)}
                className={`px-6 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 whitespace-nowrap border-b-2 ${
                  activeParent === parent 
                    ? 'text-emerald-400 border-emerald-400' 
                    : 'text-gray-500 border-transparent hover:text-white'
                }`}
              >
                {parent}
              </button>
            ))}
          </div>

          
          {activeParent !== "All" && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-2 pb-4 animate-fade-in-up">
              <button
                suppressHydrationWarning
                onClick={() => setActiveSub("All")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 whitespace-nowrap border ${
                  activeSub === "All" ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-800 hover:border-emerald-500'
                }`}
              >
                View All {activeParent}
              </button>
              
              {CATEGORY_STRUCTURE[activeParent].map((subCat) => (
                <button
                  key={subCat}
                  suppressHydrationWarning
                  onClick={() => setActiveSub(subCat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 whitespace-nowrap border ${
                    activeSub === subCat ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-transparent text-gray-400 border-gray-800 hover:border-emerald-500 hover:text-emerald-400'
                  }`}
                >
                  {subCat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* 4. PRICING / PROMO SECTION */}
      <div className="relative py-32 flex items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop')] bg-fixed bg-cover bg-center border-y border-white/5">
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <span className="px-4 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase rounded-full mb-6 inline-block border border-emerald-500/30">
            Special Offer
          </span>
          <h2 className="text-4xl md:text-6xl font-light mb-6 text-white">Summer Cool Bulk Deals</h2>
          <p className="text-gray-300 text-lg font-light mb-10">
            Stock up your retail store for the upcoming season. Get up to 30% off wholesale orders on all premium Summer Cool Gamchas.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 border border-white text-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors rounded-full">
            Request Bulk Quote
          </Link>
        </div>
      </div>

      {/* 5. TESTIMONIALS SECTION */}
      <div className="bg-[#0f0f0f] py-24 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">Trusted by Buyers</h2>
            <p className="text-gray-500 text-sm tracking-widest uppercase">What our clients say</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "The quality of the Khadi fabric we ordered in bulk was outstanding. Perfect stitching and great finish.", author: "Rajesh K.", role: "Retailer, Mumbai" },
              { text: "Kaya's Summer Cool gamchas are our best sellers. The fabric actually breathes in the summer heat.", author: "Amit S.", role: "Boutique Owner" },
              { text: "Direct factory pricing makes a huge difference. Highly recommend for any business looking for genuine textiles.", author: "Priya M.", role: "Fashion Designer" }
            ].map((review, i) => (
              <div key={i} className="bg-[#111] p-8 border border-gray-800 rounded-2xl hover:border-emerald-500/50 transition-colors">
                <div className="flex text-emerald-500 mb-6 text-sm">★★★★★</div>
                <p className="text-gray-300 font-light leading-relaxed mb-8">"{review.text}"</p>
                <div>
                  <p className="text-white font-medium text-sm tracking-wide">{review.author}</p>
                  <p className="text-gray-600 text-xs tracking-widest uppercase mt-1">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. FAQ SECTION */}
      <div className="max-w-[800px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { q: "Do you offer wholesale pricing for retail shops?", a: "Yes, we are a manufacturing unit based in Kalpi and offer significant discounts for bulk orders. Please contact us through the wholesale portal." },
            { q: "What is the difference between normal cotton and Summer Cool?", a: "Summer Cool is a specialized blend designed to be highly breathable and moisture-wicking, making it significantly more comfortable during peak Indian summers." },
            { q: "How long does shipping take?", a: "Retail orders are dispatched within 24 hours and usually arrive in 3-5 business days. Bulk orders depend on the quantity and loom availability." },
            { q: "Do you accept returns?", a: "We accept returns on retail orders within 7 days if the product is unwashed and in original condition." }
          ].map((faq, i) => (
            <details key={i} className="group bg-[#111] border border-gray-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex items-center justify-between p-6 text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.q}
                <span className="text-gray-500 group-open:rotate-45 transition-transform duration-300 text-2xl font-light">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-400 font-light text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* 7. NEWSLETTER & SELLER PORTAL SECTION */}
      <div className="border-t border-white/5 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 py-24 flex flex-col items-center">
          
          {/* Newsletter Box */}
          <div className="max-w-3xl mx-auto text-center mb-16 w-full">
            <h3 className="text-3xl font-light mb-4 text-white">Join the Kaya Family</h3>
            <p className="text-gray-400 text-sm font-light mb-10">Subscribe to get updates on new factory arrivals, wholesale deals, and seasonal sales.</p>
            <div className="flex flex-col sm:flex-row w-full max-w-xl mx-auto gap-3">
              <input 
                type="email" 
                suppressHydrationWarning
                placeholder="Enter your email address" 
                className="flex-1 px-6 py-4 bg-[#0a0a0a] border border-gray-800 rounded-full text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button suppressHydrationWarning className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold tracking-widest text-xs uppercase hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                Subscribe
              </button>
            </div>
          </div>

          {/* Become a Seller CTA */}
          <div className="max-w-2xl mx-auto text-center pt-16 border-t border-white/10 w-full animate-fade-in-up">
            <span className="text-3xl mb-4 block">🏭</span>
            <h4 className="text-2xl font-light mb-3 text-white">Partner With Kaya</h4>
            <p className="text-gray-500 text-sm font-light mb-8 max-w-md mx-auto">
              Are you a manufacturer or artisan? Expand your reach and sell your authentic fabrics and garments directly to our customers.
            </p>
            <Link 
              href="/seller" 
              className="inline-block px-8 py-3 border border-emerald-500/50 text-emerald-400 text-xs font-bold tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-all duration-300 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Seller Dashboard
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

// Reusable Components
function ProductCard({ product }) {
  return (
    <div className="group relative cursor-pointer flex flex-col h-full">
      <div className="relative overflow-hidden bg-[#111] border border-white/5 aspect-[3/4] mb-4 rounded-xl">
        {product.images && product.images[0] ? (
          <img 
            src={product.images[0].url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-700">No Image</div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <Link 
            href={`/product/${product._id}`}
            className="block w-full py-4 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-all duration-300 rounded-lg text-center"
          >
            Quick View
          </Link>
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg shadow-emerald-900/50">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
          {product.category}
        </p>
        <h3 className="text-base font-light text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-3 mt-auto">
          <span className="text-lg font-medium text-white">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-600 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-2xl bg-[#111] w-full col-span-full">
      <span className="text-5xl mb-6">📦</span>
      <h3 className="text-xl font-light text-white mb-2">No products found</h3>
      <p className="text-gray-500 text-sm font-light">We don't have any items in this specific category right now.</p>
    </div>
  );
}