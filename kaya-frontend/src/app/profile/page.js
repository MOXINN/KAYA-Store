"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

// --- HELPER: Indian Currency Formatter ---
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function UserDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    spent: 0,
  });

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contactnumber: "",
    address: { street: "", city: "", state: "", pincode: "" },
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  const [errors, setErrors] = useState({});

  // -----------------------------
  // FETCH PROFILE & ORDER STATS
  // -----------------------------
  useEffect(() => {
    fetchProfile();
    fetchOrderStats();
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/profile`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setFormData({
          fullname: data.user.fullname || "",
          email: data.user.email || "",
          contactnumber: data.user.contactnumber || "",
          address: data.user.address || { street: "", city: "", state: "", pincode: "" },
        });
      } else {
        toast.error("Session expired");
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchOrderStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/my-orders`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();

      if (res.ok && data.orders) {
        const stats = {
          total: data.orders.length,
          delivered: data.orders.filter((o) => o.orderStatus === "Delivered").length,
          pending: data.orders.filter((o) => ["Pending", "Processing", "Shipped"].includes(o.orderStatus)).length,
          spent: data.orders.reduce((acc, order) => acc + order.totalAmount, 0),
        };
        setOrderStats(stats);
      }
    } catch (err) {
      console.error("Failed to fetch order stats:", err);
    }
  }, []);

  // -----------------------------
  // HANDLE INPUTS
  // -----------------------------
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "pincode"].includes(name)) {
      setFormData((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  const checkPasswordStrength = useCallback((password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = score === 0 ? "" : "Weak";
    let color = "text-red-500";
    let barColor = "bg-red-500";
    let width = "w-1/4";

    if (score >= 4) {
      label = "Strong";
      color = "text-emerald-400";
      barColor = "bg-emerald-500";
      width = "w-full";
    } else if (score >= 2) {
      label = "Medium";
      color = "text-yellow-400";
      barColor = "bg-yellow-500";
      width = "w-2/4";
    }

    setPasswordStrength({ score, label, color, barColor, width });
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (name === "newPassword") checkPasswordStrength(value);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validateProfileForm = useCallback(() => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.contactnumber.trim()) {
      newErrors.contactnumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.contactnumber)) {
      newErrors.contactnumber = "Phone must be 10 digits";
    }
    if (!formData.address.street.trim()) newErrors.street = "Street address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validatePasswordForm = useCallback(() => {
    const newErrors = {};
    if (!passwords.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwords]);

  // -----------------------------
  // SUBMISSIONS
  // -----------------------------
  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        fetchOrderStats();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  }, [formData, validateProfileForm, fetchOrderStats]);

  const handleUpdatePassword = useCallback(async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordStrength({ score: 0, label: "", color: "", barColor: "", width: "w-0" });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  }, [passwords, validatePasswordForm]);

  const handleDeleteAccount = useCallback(async () => {
    if (!window.confirm("Are you absolutely sure? This action cannot be undone.")) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Account deleted successfully");
        localStorage.removeItem("token");
        router.push("/");
      } else {
        toast.error("Failed to delete account");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  }, [router]);

  const logout = useCallback(() => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  }, [router]);

  // -----------------------------
  // UI RENDERS
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="tracking-widest uppercase text-sm font-light">Loading Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-wide mb-2">My Hub</h1>
          <p className="text-gray-400 font-light">Manage your preferences, security, and track your orders.</p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* SIDEBAR */}
          <div className="md:col-span-3 space-y-2 sticky top-8 h-fit">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center gap-4 ${
                activeTab === "profile" ? "bg-[#111] border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "hover:bg-[#111] text-gray-400 border border-transparent"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="font-medium tracking-wide">Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center gap-4 ${
                activeTab === "security" ? "bg-[#111] border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "hover:bg-[#111] text-gray-400 border border-transparent"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="font-medium tracking-wide">Security</span>
            </button>

            <Link href="/orders" className="w-full text-left px-5 py-4 rounded-xl hover:bg-[#111] text-gray-400 border border-transparent transition-all flex items-center gap-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="font-medium tracking-wide">My Orders</span>
            </Link>

            <button onClick={logout} className="w-full text-left px-5 py-4 rounded-xl hover:bg-red-900/10 text-red-400 border border-transparent transition-all flex items-center gap-4 mt-8">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="font-medium tracking-wide">Logout</span>
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="md:col-span-9">
            
            {/* QUICK STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#111] border border-white/5 p-5 rounded-2xl shadow-lg">
                <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Total Orders</p>
                <p className="text-3xl font-light">{orderStats.total}</p>
              </div>
              <div className="bg-[#111] border border-white/5 p-5 rounded-2xl shadow-lg">
                <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Delivered</p>
                <p className="text-3xl font-light text-emerald-400">{orderStats.delivered}</p>
              </div>
              <div className="bg-[#111] border border-white/5 p-5 rounded-2xl shadow-lg">
                <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Pending</p>
                <p className="text-3xl font-light text-yellow-400">{orderStats.pending}</p>
              </div>
              <div className="bg-[#111] border border-white/5 p-5 rounded-2xl shadow-lg">
                <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Total Spent</p>
                <p className="text-3xl font-light text-emerald-400">{formatINR(orderStats.spent)}</p>
              </div>
            </div>

            {/* TAB: PROFILE DETAILS */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl space-y-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium text-emerald-400">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                    <input name="fullname" value={formData.fullname} onChange={handleProfileChange} className={`w-full bg-gray-900 border ${errors.fullname ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} placeholder="John Doe" />
                    {errors.fullname && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.fullname}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <input name="email" value={formData.email} onChange={handleProfileChange} className={`w-full bg-gray-900 border ${errors.email ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} placeholder="john@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm text-gray-400 mb-2">Contact Number</label>
                    <input name="contactnumber" value={formData.contactnumber} onChange={handleProfileChange} className={`w-full bg-gray-900 border ${errors.contactnumber ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} placeholder="10-digit number" />
                    {errors.contactnumber && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.contactnumber}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                  <h2 className="text-xl font-medium text-emerald-400 mb-6">Delivery Address</h2>
                  <div className="space-y-6">
                    <div>
                      <input name="street" value={formData.address.street} onChange={handleProfileChange} placeholder="Street Address (House No, Area)" className={`w-full bg-gray-900 border ${errors.street ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                      {errors.street && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.street}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <input name="city" value={formData.address.city} onChange={handleProfileChange} placeholder="City" className={`w-full bg-gray-900 border ${errors.city ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                        {errors.city && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.city}</p>}
                      </div>
                      <div>
                        <input name="state" value={formData.address.state} onChange={handleProfileChange} placeholder="State" className={`w-full bg-gray-900 border ${errors.state ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                        {errors.state && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.state}</p>}
                      </div>
                      <div>
                        <input name="pincode" value={formData.address.pincode} onChange={handleProfileChange} placeholder="Pincode" className={`w-full bg-gray-900 border ${errors.pincode ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                        {errors.pincode && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.pincode}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={updating} className="w-full sm:w-auto bg-emerald-600 px-8 py-4 rounded-xl text-sm font-bold tracking-[0.15em] uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 mt-4">
                  {updating ? "Saving Changes..." : "Save Profile"}
                </button>
              </form>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl animate-in fade-in duration-300">
                <form onSubmit={handleUpdatePassword} className="max-w-md space-y-6">
                  <h2 className="text-xl font-medium text-emerald-400 mb-6">Change Password</h2>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                    <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className={`w-full bg-gray-900 border ${errors.currentPassword ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                    {errors.currentPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className={`w-full bg-gray-900 border ${errors.newPassword ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                    
                    {/* Visual Password Strength Meter */}
                    {passwords.newPassword && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${passwordStrength.barColor} ${passwordStrength.width}`}></div>
                        </div>
                        <p className={`text-xs mt-1.5 font-medium ${passwordStrength.color}`}>Strength: {passwordStrength.label}</p>
                      </div>
                    )}
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className={`w-full bg-gray-900 border ${errors.confirmPassword ? "border-red-500" : "border-gray-800"} rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors`} />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>}
                  </div>

                  <button type="submit" disabled={updating} className="w-full bg-emerald-600 px-8 py-4 rounded-xl text-sm font-bold tracking-[0.15em] uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50">
                     {updating ? "Updating..." : "Update Password"}
                  </button>
                </form>

                <div className="mt-16 border-t border-red-900/30 pt-8 max-w-md">
                  <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-6 font-light">Once you delete your account, all your order history and saved data will be permanently wiped. This action cannot be reversed.</p>
                  <button onClick={handleDeleteAccount} className="w-full px-6 py-4 border border-red-500/30 bg-red-500/5 text-red-400 rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all text-sm font-bold tracking-[0.15em] uppercase">
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}