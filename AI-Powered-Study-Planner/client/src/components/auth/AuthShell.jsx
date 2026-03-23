import React from "react";
import { motion } from "framer-motion";
import AuthScene from "./AuthScene";

function AuthShell({
  title,
  subtitle,
  children,
  sideTitle,
  sideText,
  mode = "login",
}) {
  const dark = document.documentElement.classList.contains("dark");

  return (
    <div className="min-h-screen auth-gold-bg flex items-center justify-center px-4 py-8 overflow-hidden">
      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-7xl relative"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: mode === "login" ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-[40px] p-8 lg:p-10 relative overflow-hidden sparkle-overlay"
          >
            <div className="relative z-10 max-w-xl">
              <p className="text-sm uppercase tracking-[0.34em] text-amber-600 dark:text-amber-300 font-bold">
                AI Powered Study Planner
              </p>

              <h1 className="mt-5 text-6xl leading-[0.95] font-black auth-heading">
                {title}
              </h1>

              <p className="mt-5 text-xl auth-subtext">
                {subtitle}
              </p>

              <div className="mt-10">{children}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: mode === "login" ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.68 }}
            className="glass-card rounded-[40px] relative overflow-hidden min-h-[720px] hidden lg:block"
          >
            <div className="absolute inset-0 pointer-events-none">
  <AuthScene dark={dark} />
</div>

<div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-black/10" />

            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
              <div className="max-w-md">
                <h2 className="text-6xl font-black leading-[0.95] gold-text">
                  {sideTitle}
                </h2>
                <p className="mt-5 text-lg leading-8 auth-subtext">
                  {sideText}
                </p>
              </div>

              <div className="self-end text-right">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/55 dark:bg-white/8 border border-amber-200/40 dark:border-white/10 backdrop-blur-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Premium Focus Experience
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthShell;