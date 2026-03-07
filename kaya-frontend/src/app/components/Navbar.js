"use client";
import Link from "next/link";
import  ThemeToggle  from "./ThemeToggle"; // Make sure the import matches your exported function
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 1. Handle Scroll Effect for "Glassmorphism"
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Auth & Cart Sync
  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const totalItems = data.cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Cart count sync failed:", error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) fetchCartCount();

    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [pathname, fetchCartCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCartCount(0);
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  if (!isMounted) return null;
  if (pathname.startsWith("/seller")) return null;

  return (
    <nav
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-gray-200 dark:border-emerald-500/10 py-2 shadow-xl dark:shadow-2xl" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => router.push("/")}
          >
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 group-hover:border-emerald-400 dark:group-hover:border-emerald-500/50 transition-all">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-500 dark:group-hover:from-emerald-400 dark:group-hover:to-teal-300 transition-all duration-500">
              KAYA<span className="text-emerald-500">.</span>
            </span>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
            <NavLink href="/">Shop</NavLink>
            <NavLink href="/about">Story</NavLink>

            {/* User Account Link (Hidden if Guest) */}
            {isLoggedIn && (
              <Link href="/profile" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium tracking-widest uppercase">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                My Hub
              </Link>
            )}

            <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-800 pl-8">
              {/* Magic Theme Toggle Button */}
              <ThemeToggle />

              {/* Cart with dynamic badge */}
              <Link href="/cart" className="group relative flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <div className="relative p-2 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-black">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* AUTH ACTIONS */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="group flex items-center gap-2 px-6 py-2 text-xs font-bold tracking-widest uppercase text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/50 transition-all"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="px-7 py-2.5 bg-emerald-600 text-white text-xs font-bold tracking-widest uppercase rounded-full hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-900/20">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLES (Theme + Menu) */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div 
        className={`md:hidden absolute w-full bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-white/5 transition-all duration-500 ease-in-out shadow-xl ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-6 py-10 space-y-6">
          <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Collection</MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>Our Heritage</MobileNavLink>
          <MobileNavLink href="/cart" onClick={() => setIsMobileMenuOpen(false)}>Your Bag ({cartCount})</MobileNavLink>
          
          {isLoggedIn && (
            <MobileNavLink href="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</MobileNavLink>
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-white/10">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="w-full py-4 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 rounded-2xl font-bold tracking-widest uppercase text-sm border border-red-200 dark:border-red-500/20"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-4 text-center text-gray-600 dark:text-gray-400 font-bold tracking-widest uppercase text-xs border border-gray-200 dark:border-white/10 rounded-2xl">
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-4 text-center bg-emerald-600 text-white font-bold tracking-widest uppercase text-xs rounded-2xl shadow-lg shadow-emerald-900/20">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Sub-Components for Clean Code
function NavLink({ href, children }) {
  return (
    <Link 
      href={href} 
      className="text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="block text-2xl font-light tracking-wide text-gray-800 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
    >
      {children}
    </Link>
  );
}