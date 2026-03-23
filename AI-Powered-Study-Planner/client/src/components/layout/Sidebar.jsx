import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  TimerReset,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/planner", label: "Smart Planner", icon: Brain },
    { to: "/focus", label: "Focus Mode", icon: TimerReset },
    { to: "/performance", label: "Performance", icon: BarChart3 },
    { to: "/suggestions", label: "AI Suggestions", icon: Sparkles },
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
            <h1 className="text-3xl font-black gold-text">Smart Planner</h1>
            <p className="section-subtitle mt-2 font-medium">
              Focus Tracking System
            </p>
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
          <p className="text-sm metric-title">Logged in as</p>
          <p className="font-bold metric-value mt-1">{user.name || "User"}</p>
          <button
            onClick={handleLogout}
            className="mt-4 w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white py-3 font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;