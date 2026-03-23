import React from "react";
import { Bell, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function Topbar({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[28px] px-6 py-5 flex items-center justify-between"
    >
      <div>
        <h2 className="text-3xl font-black gold-text">{title}</h2>
        {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button className="h-11 w-11 rounded-2xl bg-white/70 dark:bg-white/5 border border-amber-200/50 dark:border-white/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-amber-600 dark:text-amber-300" />
        </button>
        <button className="h-11 w-11 rounded-2xl bg-white/70 dark:bg-white/5 border border-amber-200/50 dark:border-white/10 flex items-center justify-center">
          <UserCircle2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
      </div>
    </motion.div>
  );
}

export default Topbar;