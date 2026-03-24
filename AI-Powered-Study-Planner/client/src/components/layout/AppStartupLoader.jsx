import React from "react";
import logoMark from "../../assets/branding/focustra.png";

function AppStartupLoader() {
  const dark = document.documentElement.classList.contains("dark");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center page-lux-bg px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20 dark:opacity-15">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.24)_50%,transparent_100%)] animate-[pulse_2.2s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(217,168,58,0.08)_1px,transparent_1px),linear-gradient(to_right,rgba(217,168,58,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_bottom,rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(to_right,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="absolute inset-0 bg-amber-300/10 dark:bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative flex flex-col items-center">
            <img
              src={logoMark}
              alt="Focus Trax Logo"
              className="w-[215px] h-[215px] object-contain opacity-0 animate-[startupLogoReveal_0.8s_ease-out_0.15s_forwards]"
              draggable="false"
            />

            <div className="mt-5 overflow-hidden w-full flex justify-center">
              <h2
                className="whitespace-nowrap opacity-0 animate-[startupWordReveal_0.95s_ease-out_0.42s_forwards]"
                style={{
                  fontSize: "clamp(2.0rem,6vw,4.5rem)",
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontFamily:
                    "'Times New Roman', 'Cormorant Garamond', 'Cinzel', serif",
                  background: dark
                    ? "linear-gradient(90deg, #f7dfa1 0%, #f0bb4e 45%, #d8951f 100%)"
                    : "linear-gradient(90deg, #b7790f 0%, #d69c1b 45%, #8c5a00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                Focus Trax
              </h2>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.38em] text-amber-700 dark:text-cyan-300 font-bold opacity-0 animate-[startupSubReveal_0.7s_ease-out_0.95s_forwards]">
              Initializing Workspace
            </p>

            <p className="mt-4 text-lg auth-subtext opacity-0 animate-[startupSubReveal_0.75s_ease-out_1.12s_forwards]">
              Syncing smart planning, analytics, and focus systems
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 opacity-0 animate-[startupSubReveal_0.75s_ease-out_1.28s_forwards]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 dark:bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-amber-300 animate-bounce" />
          </div>
        </div>

        <style>{`
          @keyframes startupLogoReveal {
            0% {
              opacity: 0;
              transform: translateY(14px) scale(0.94);
            }
            100% {
              opacity: 1;
              transform: translateY(0px) scale(1);
            }
          }

          @keyframes startupWordReveal {
            0% {
              opacity: 0;
              transform: translateY(18px);
              clip-path: inset(0 100% 0 0);
            }
            100% {
              opacity: 1;
              transform: translateY(0px);
              clip-path: inset(0 0 0 0);
            }
          }

          @keyframes startupSubReveal {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default AppStartupLoader;