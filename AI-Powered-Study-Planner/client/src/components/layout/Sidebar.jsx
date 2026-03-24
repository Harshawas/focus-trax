import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  TimerReset,
  BarChart3,
  Sparkles,
  Settings,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import FocusFlowLogo from "../branding/FocusFlowLogo";

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/planner", label: "Smart Planner", icon: Brain },
    { to: "/focus", label: "Focus Mode", icon: TimerReset },
    { to: "/performance", label: "Performance", icon: BarChart3 },
    { to: "/suggestions", label: "AI Suggestions", icon: Sparkles },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[290px] min-h-screen p-4 hidden md:block"
    >
      <div className="glass-card sparkle-overlay rounded-[32px] h-full p-5 flex flex-col justify-between">
        <div className="relative z-10">
          <div className="pb-5 border-b border-amber-200/30 dark:border-white/10">
            <FocusFlowLogo size={52} />
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg"
                        : "sidebar-text hover:bg-white/65 dark:hover:bg-white/8"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="relative z-10 rounded-[24px] bg-white/65 dark:bg-white/5 border border-amber-200/40 dark:border-white/10 p-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="User"
                className="w-12 h-12 rounded-full object-cover border border-amber-200 dark:border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-100 dark:bg-slate-800 text-lg font-black gold-text">
                {(user.name || "U").charAt(0)}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-sm metric-title">Logged in as</p>
              <p className="font-bold metric-value truncate">{user.name || "User"}</p>
              {user.username ? (
                <p className="text-xs section-subtitle truncate">@{user.username}</p>
              ) : null}
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="mt-4 w-full rounded-2xl bg-white/70 dark:bg-white/8 border border-amber-200/40 dark:border-white/10 py-3 font-bold section-title transition"
          >
            View Profile
          </button>

          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white py-3 font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;