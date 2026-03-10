"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function UserDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    color: "text-gray-500",
    barColor: "bg-gray-700",
    width: "w-0",
  });

  const [errors, setErrors] = useState({});

  // Fetch data
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      toast.error("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchOrderStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/orders/my-orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (res.ok && data.orders) {
        const stats = {
          total: data.orders.length,
          delivered: data.orders.filter((o) => o.orderStatus === "Delivered").length,
          pending: data.orders.filter((o) => ["Pending", "Processing", "Shipped"].includes(o.orderStatus)).length,
          spent: data.orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0),
        };
        setOrderStats(stats);
      }
    } catch (err) {
      console.error("Failed to fetch order stats:", err);
    }
  }, []);

  // Handlers
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "pincode"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  const checkPasswordStrength = useCallback((password) => {
    if (!password) {
      setPasswordStrength({ score: 0, label: "", color: "text-gray-500", barColor: "bg-gray-700", width: "w-0" });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { label: "Very Weak", color: "text-red-500", barColor: "bg-red-500", width: "w-1/5" },
      1: { label: "Weak", color: "text-red-500", barColor: "bg-red-500", width: "w-2/5" },
      2: { label: "Fair", color: "text-yellow-400", barColor: "bg-yellow-400", width: "w-3/5" },
      3: { label: "Good", color: "text-emerald-400", barColor: "bg-emerald-400", width: "w-4/5" },
      4: { label: "Strong", color: "text-emerald-500", barColor: "bg-emerald-500", width: "w-full" },
      5: { label: "Very Strong", color: "text-emerald-500", barColor: "bg-emerald-500", width: "w-full" },
    };

    setPasswordStrength({ score, ...strengthMap[score] });
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (name === "newPassword") checkPasswordStrength(value);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validateProfileForm = useCallback(() => {
    const newErrors = {};
    if (!formData.fullname?.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.contactnumber?.trim()) newErrors.contactnumber = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.contactnumber))
      newErrors.contactnumber = "Phone must be 10 digits";

    if (!formData.address.street?.trim()) newErrors.street = "Street address is required";
    if (!formData.address.city?.trim()) newErrors.city = "City is required";
    if (!formData.address.state?.trim()) newErrors.state = "State is required";
    if (!formData.address.pincode?.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.address.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validatePasswordForm = useCallback(() => {
    const newErrors = {};
    if (!passwords.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwords.newPassword) newErrors.newPassword = "New password is required";
    else if (passwords.newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters";

    if (passwords.newPassword !== passwords.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwords]);

  // Submit handlers
  const handleUpdateProfile = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateProfileForm()) {
        toast.error("Please fix the errors");
        return;
      }
      setUpdating(true);
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/profile`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData),
          }
        );
        const data = await res.json();

        if (res.ok) {
          toast.success("Profile updated successfully!");
          fetchOrderStats();
        } else {
          toast.error(data.message || "Update failed");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setUpdating(false);
      }
    },
    [formData, validateProfileForm, fetchOrderStats]
  );

  const handleUpdatePassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validatePasswordForm()) return;

      setUpdating(true);
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/update-password`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(passwords),
          }
        );
        const data = await res.json();

        if (res.ok) {
          toast.success("Password updated successfully!");
          setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setPasswordStrength({ score: 0, label: "", color: "text-gray-500", barColor: "bg-gray-700", width: "w-0" });
        } else {
          toast.error(data.message || "Failed to update password");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setUpdating(false);
      }
    },
    [passwords, validatePasswordForm]
  );

  const handleDeleteAccount = useCallback(async () => {
    if (!window.confirm("⚠️ This will permanently delete your account and all data. Continue?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/users/profile`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Account deleted");
        localStorage.removeItem("token");
        router.push("/");
      } else {
        toast.error("Failed to delete account");
      }
    } catch {
      toast.error("Network error");
    }
  }, [router]);

  const logout = useCallback(() => {
    if (!window.confirm("Logout?")) return;
    localStorage.removeItem("token");
    toast.success("Logged out");
    router.push("/login");
  }, [router]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="mt-6 text-gray-400 text-sm tracking-[3px] font-light">LOADING YOUR HUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-light tracking-tighter">My Hub</h1>
            <p className="text-gray-400 mt-2 text-lg">Your personal command center</p>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-3 rounded-xl bg-[#111] border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className={`
            lg:col-span-3 lg:sticky lg:top-8 lg:h-fit
            fixed lg:relative inset-0 lg:inset-auto bg-[#0a0a0a] z-50 lg:z-auto
            transform transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="lg:hidden flex justify-end p-4">
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400">✕</button>
            </div>

            <div className="space-y-2 p-4 lg:p-0">
              {[
                { id: "profile", label: "Profile Details", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all group ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-900/20"
                      : "hover:bg-white/5 text-gray-400 border border-transparent"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  <span className="font-medium tracking-wide">{tab.label}</span>
                </button>
              ))}

              <Link
                href="/orders"
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left hover:bg-white/5 text-gray-400 border border-transparent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-medium tracking-wide">My Orders</span>
              </Link>

              <button
                onClick={logout}
                className="w-full mt-8 flex items-center gap-4 px-6 py-4 rounded-2xl text-left text-red-400 hover:bg-red-950/30 border border-transparent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium tracking-wide">Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Orders", value: orderStats.total, color: "text-white" },
                { label: "Delivered", value: orderStats.delivered, color: "text-emerald-400" },
                { label: "Pending", value: orderStats.pending, color: "text-amber-400" },
                { label: "Total Spent", value: formatINR(orderStats.spent), color: "text-emerald-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#111] border border-white/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group">
                  <p className="text-xs tracking-[2px] text-gray-500 font-medium">{stat.label}</p>
                  <p className={`text-4xl font-light mt-3 tracking-tighter ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="bg-[#111] border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
                <h2 className="text-2xl font-light text-emerald-400 mb-8">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Full Name</label>
                    <input
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleProfileChange}
                      className={`w-full bg-zinc-950 border ${errors.fullname ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none transition-all`}
                    />
                    {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      className={`w-full bg-zinc-950 border ${errors.email ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none transition-all`}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-gray-400">Contact Number</label>
                    <input
                      name="contactnumber"
                      value={formData.contactnumber}
                      onChange={handleProfileChange}
                      className={`w-full bg-zinc-950 border ${errors.contactnumber ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none transition-all`}
                    />
                    {errors.contactnumber && <p className="text-red-500 text-sm">{errors.contactnumber}</p>}
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10">
                  <h2 className="text-2xl font-light text-emerald-400 mb-8">Delivery Address</h2>

                  <div className="space-y-6">
                    <input
                      name="street"
                      value={formData.address.street}
                      onChange={handleProfileChange}
                      placeholder="Street Address, House No., Area"
                      className={`w-full bg-zinc-950 border ${errors.street ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none transition-all`}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <input name="city" value={formData.address.city} onChange={handleProfileChange} placeholder="City" className={`bg-zinc-950 border ${errors.city ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none`} />
                      <input name="state" value={formData.address.state} onChange={handleProfileChange} placeholder="State" className={`bg-zinc-950 border ${errors.state ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none`} />
                      <input name="pincode" value={formData.address.pincode} onChange={handleProfileChange} placeholder="Pincode" className={`bg-zinc-950 border ${errors.pincode ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none`} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="mt-10 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 px-12 py-4 rounded-2xl font-semibold tracking-wider text-sm uppercase transition-all shadow-lg shadow-emerald-900/40"
                >
                  {updating ? "Saving Changes..." : "Save Profile"}
                </button>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 lg:p-10">
                <form onSubmit={handleUpdatePassword} className="max-w-md">
                  <h2 className="text-2xl font-light text-emerald-400 mb-8">Change Password</h2>

                  <div className="space-y-8">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full bg-zinc-950 border ${errors.currentPassword ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none`}
                      />
                      {errors.currentPassword && <p className="text-red-500 text-sm mt-1.5">{errors.currentPassword}</p>}
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full bg-zinc-950 border ${errors.newPassword ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none`}
                      />

                      {passwords.newPassword && (
                        <div className="mt-4">
                          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${passwordStrength.barColor} ${passwordStrength.width}`} />
                          </div>
                          <p className={`text-xs mt-2 font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}

                      {errors.newPassword && <p className="text-red-500 text-sm mt-1.5">{errors.newPassword}</p>}
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full bg-zinc-950 border ${errors.confirmPassword ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"} rounded-2xl px-6 py-4 outline-none`}
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="mt-10 w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 py-4 rounded-2xl font-semibold tracking-wider text-sm uppercase transition-all"
                  >
                    {updating ? "Updating Password..." : "Update Password"}
                  </button>
                </form>

                {/* Danger Zone */}
                <div className="mt-20 pt-10 border-t border-red-900/30">
                  <h3 className="text-red-400 text-xl font-medium mb-3">Danger Zone</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                    Deleting your account will permanently remove all your orders, addresses, and data. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="mt-8 px-8 py-4 border border-red-500/40 hover:border-red-500 text-red-400 hover:bg-red-500/10 rounded-2xl text-sm font-bold tracking-widest transition-all"
                  >
                    DELETE MY ACCOUNT
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