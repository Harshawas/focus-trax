import React from "react";

function AppLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-amber-300/10 dark:bg-cyan-500/10 blur-3xl rounded-full" />

        

          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-300/40 dark:border-cyan-400/30" />
              <div className="absolute inset-2 rounded-full border border-amber-400/30 dark:border-cyan-300/25" />
              <div className="absolute inset-0 rounded-full border-t-4 border-amber-500 dark:border-cyan-400 animate-spin" />
              <div className="absolute inset-4 rounded-full border-r-4 border-blue-500 dark:border-blue-400 animate-[spin_1.8s_linear_reverse_infinite]" />
              <div className="absolute inset-8 rounded-full border-l-4 border-orange-500 dark:border-amber-300 animate-spin" />

              <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 dark:from-cyan-300 dark:via-blue-400 dark:to-cyan-500 shadow-[0_0_30px_rgba(245,158,11,0.45)] dark:shadow-[0_0_30px_rgba(34,211,238,0.45)] animate-pulse" />

              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500 dark:bg-cyan-400 animate-ping" />
              <div className="absolute bottom-3 right-5 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-amber-300 animate-pulse" />
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs uppercase tracking-[0.38em] text-amber-700 dark:text-cyan-300 font-bold">
                Initializing System
              </p>

              <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {message}
              </h3>

              

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 dark:bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-amber-300 animate-bounce" />
              </div>

            </div>
          </div>
        </div>

        <style>{`
          @keyframes loaderBar {
            0% { transform: translateX(-100%); width: 30%; }
            50% { transform: translateX(30%); width: 45%; }
            100% { transform: translateX(220%); width: 30%; }
          }
        `}</style>
      </div>
  );
}

export default AppLoader;