import React from "react";

function AppLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200/40 dark:border-slate-700/50" />

          <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-amber-500 dark:border-amber-400 animate-spin" />

          <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-4 border-l-4 border-blue-500 dark:border-blue-400 animate-[spin_1.6s_linear_reverse_infinite]" />

          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-[0_0_35px_rgba(245,158,11,0.45)] animate-pulse" />

          <div className="absolute w-2 h-2 rounded-full bg-white top-3 left-1/2 -translate-x-1/2 animate-ping" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg font-bold tracking-wide text-slate-800 dark:text-slate-100">
            {message}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" />
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 tracking-[0.22em] uppercase">
            Initializing System
          </p>
        </div>

        <div className="absolute -z-10 w-56 h-56 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-3xl" />
      </div>
    </div>
  );
}

export default AppLoader;