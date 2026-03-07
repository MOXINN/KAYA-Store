"use client";
import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      
      {/* 1. HEADER SECTION (Parallax) */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=2000&auto=format&fit=crop')] bg-fixed bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto mt-16">
          <p className="text-emerald-400 text-sm tracking-[0.4em] uppercase font-medium mb-6 animate-fade-in-up">Our Heritage</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 text-white">
            The Threads of <span className="italic text-gray-400">Kalpi.</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed">
            Preserving the authentic art of handloom weaving, one premium fabric at a time.
          </p>
        </div>
      </div>

      {/* 2. ABOUT / MISSION SECTION */}
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative overflow-hidden rounded-2xl bg-[#111] border border-white/5">
            <img 
              src="https://www.antiquemapsandprints.com/cdn/shop/files/P-5-02273a_cba45269-acd0-4630-9272-d7dc2e5dc30f.jpg?v=1753618488&width=1920" 
              alt="Traditional Weaving" 
              className="w-full h-full hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-emerald-400 text-xs tracking-widest uppercase font-bold mb-4">The Kaya Mission</span>
            <h2 className="text-3xl md:text-4xl font-light mb-8 leading-tight">Crafted with precision, rooted in tradition.</h2>
            <div className="space-y-6 text-gray-400 font-light leading-relaxed text-sm">
              <p>
                Nestled in the historic town of Kalpi, Kaya represents a generational commitment to textile excellence. We don't just sell fabrics; we manufacture them. From the rhythmic clacking of our handlooms to the final stitch of a Summer Cool Gamcha, every piece in our collection carries the fingerprint of our artisans.
              </p>
              <p>
                Our journey began with a simple vision: to bring authentic, high-quality Khadi and handloom cotton to the modern world without compromising on the ethical, sustainable practices that define true Indian textiles. 
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATS SECTION */}
      <div className="border-y border-white/5 bg-[#0f0f0f]">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="p-4">
              <h3 className="text-4xl md:text-5xl font-light text-white mb-2">100%</h3>
              <p className="text-gray-500 text-xs tracking-widest uppercase">Authentic Khadi</p>
            </div>
            <div className="p-4">
              <h3 className="text-4xl md:text-5xl font-light text-white mb-2">50+</h3>
              <p className="text-gray-500 text-xs tracking-widest uppercase">Skilled Artisans</p>
            </div>
            <div className="p-4">
              <h3 className="text-4xl md:text-5xl font-light text-white mb-2">10k+</h3>
              <p className="text-gray-500 text-xs tracking-widest uppercase">Meters Woven</p>
            </div>
            <div className="p-4">
              <h3 className="text-4xl md:text-5xl font-light text-white mb-2">Direct</h3>
              <p className="text-gray-500 text-xs tracking-widest uppercase">Factory to Retail</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TEAM SECTION (Parallax) */}
      <div className="relative py-32 flex items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop')] bg-fixed bg-cover bg-center border-b border-white/5">
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4 text-white">Meet the Makers</h2>
            <p className="text-gray-400 text-sm tracking-widest uppercase">The minds behind the looms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Founder Profile */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full mb-6 border-2 border-emerald-500 overflow-hidden">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop')] bg-cover bg-center"></div>
              </div>
              <h3 className="text-xl font-medium text-white mb-1">Mohd Mohsin Ansari</h3>
              <p className="text-emerald-400 text-xs tracking-widest uppercase mb-4">Founder & Master Weaver</p>
              <p className="text-gray-400 text-sm font-light">With decades of experience in the textile industry, he oversees the manufacturing unit in Kalpi, ensuring every thread meets our rigorous standards.</p>
            </div>

            {/* Tech Profile */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full mb-6 border-2 border-emerald-500 overflow-hidden">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop')] bg-cover bg-center"></div>
              </div>
              <h3 className="text-xl font-medium text-white mb-1">Director name</h3>
              <p className="text-emerald-400 text-xs tracking-widest uppercase mb-4">Director</p>
              <p className="text-gray-400 text-sm font-light">Bridging the gap between traditional manufacturing and the digital world, bringing Kaya's authentic handlooms to a global audience online.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CUSTOMER & AWARD LOGOS SECTION */}
      <div className="bg-[#0f0f0f] py-20 border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-10">Trusted Supply Partner For</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Icons for B2B Partners / Brands */}
            <div className="text-2xl font-bold tracking-tighter">FABRICA</div>
            <div className="text-2xl font-serif italic">The Loom Co.</div>
            <div className="text-2xl font-light tracking-widest">THREADWORKS</div>
            <div className="text-2xl font-bold">KĀPĀSA</div>
          </div>
        </div>
      </div>

      {/* 6. CTA SECTION */}
      <div className="py-32 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-light mb-6">Experience the Craftsmanship</h2>
        <p className="text-gray-400 text-sm md:text-base font-light mb-10 max-w-xl mx-auto">
          Explore our latest collection of premium Khadi, Summer Cool gamchas, and authentic handlooms.
        </p>
        <Link 
          href="/" 
          suppressHydrationWarning
          className="inline-block px-12 py-5 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-emerald-500 hover:text-white transition-all duration-300 rounded-full shadow-lg shadow-white/5"
        >
          Shop The Collection
        </Link>
      </div>

    </div>
  );
}