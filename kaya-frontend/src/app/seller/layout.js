"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, Clock, PlusCircle, LayoutDashboard, 
  LogOut, Menu, X, Bell, Search, User
} from "lucide-react";

export default function SellerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pages that should NOT have the sidebar or navbar
  const [isAuthorized, setIsAuthorized] = useState(false); 

  const isAuthPage = pathname === "/seller/login" || pathname === "/seller/register";

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthPage) {
      const token = localStorage.getItem("ownerToken");
      if (!token) {
        router.replace("/seller/login");
      } else {
        // 2. SET TO TRUE IF TOKEN EXISTS
        setIsAuthorized(true);
      }
    }
  }, [pathname, isAuthPage, router]);

  if (!isMounted) return null;

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#050505] text-white">{children}</div>;
  }

  // 3.  THE AUTH GATE: Prevent dashboard pages from rendering at all if not authorized!
  if (!isAuthorized) return null;

  const handleLogout = () => {
    localStorage.removeItem("ownerToken");
    router.push("/seller/login");
  };

  // Helper for Navigation Links
  const NavItem = ({ href, icon, label }) => {
    const isActive = pathname === href || (href === "/seller" && pathname === "/seller/dashboard");
    return (
      <Link 
        href={href} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
          isActive 
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        {icon} {label}
      </Link>
    );
  };

  // Format the page name for the header
  const getPageTitle = () => {
    if (pathname === "/seller") return "Dashboard Overview";
    const path = pathname.split("/").pop();
    return path.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      
      {/* 1. DESKTOP LEFT SIDEBAR */}
      <aside className="w-72 border-r border-white/5 bg-[#0a0a0a] hidden lg:flex flex-col h-screen z-50">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-white/5 cursor-pointer" onClick={() => router.push("/seller")}>
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Package size={20} className="text-black" />
          </div>
          <h2 className="text-xl font-bold tracking-tighter">KAYA SELLER</h2>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-4">Main Menu</p>
          <NavItem href="/seller" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem href="/seller/orders" icon={<Clock size={18} />} label="Manage Orders" />
          <NavItem href="/seller/products" icon={<Package size={18} />} label="Inventory Ledger" />
          <NavItem href="/seller/add-product" icon={<PlusCircle size={18} />} label="Publish Product" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-rose-500 font-bold uppercase tracking-widest text-xs hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20">
            <LogOut size={16} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE: MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* 2. 🚨 THE SELLER TOP NAVBAR 🚨 */}
        <header className="h-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40 sticky top-0">
          
          {/* Left Side: Mobile Menu Toggle & Dynamic Title */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-medium text-white">{getPageTitle()}</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Kaya Admin Portal</p>
            </div>
          </div>

          {/* Right Side: Search, Notifications, Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Quick Search */}
            <div className="hidden md:flex items-center relative group">
              <Search size={16} className="absolute left-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search ticket or name..." 
                className="bg-[#111] border border-gray-800 rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all w-64"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative text-gray-400 hover:text-white transition-colors p-2">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>

            {/* Profile Block */}
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-white/5 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-900 border border-emerald-500/30 flex items-center justify-center text-white font-bold group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                M
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none mb-1">Mohsin</p>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest leading-none font-bold">Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC PAGE CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto bg-[#050505]">
          {children}
        </main>

      </div>

      {/* MOBILE FULL-SCREEN MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
               <div className="flex items-center gap-3">
                 <div className="bg-emerald-500 p-1.5 rounded-lg"><Package size={18} className="text-black" /></div>
                 <span className="font-bold tracking-tighter text-lg">KAYA SELLER</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              <NavItem href="/seller" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <NavItem href="/seller/orders" icon={<Clock size={18} />} label="Orders" />
              <NavItem href="/seller/products" icon={<Package size={18} />} label="Inventory" />
              <NavItem href="/seller/add-product" icon={<PlusCircle size={18} />} label="Add Product" />
            </nav>
            <div className="p-6 border-t border-white/5">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-rose-500/10 text-rose-500 font-bold uppercase tracking-widest text-xs rounded-xl">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}