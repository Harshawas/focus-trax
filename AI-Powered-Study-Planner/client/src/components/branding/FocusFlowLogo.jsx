import React from "react";
import logoMark from "../../assets/branding/focustra.png";

function FocusFlowLogo({
  size = 56,
  showText = true,
  textClassName = "",
  iconOnly = false,
}) {
  const dark = document.documentElement.classList.contains("dark");

  return (
    <div className="flex items-center gap-3">
      <img
        src={logoMark}
        alt="Focus Trax Logo"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
        className="select-none"
        draggable="false"
      />

      {!iconOnly && showText && (
        <div className={textClassName}>
          <h1
            className="leading-none font-black"
            style={{
              fontSize: "1.7rem",
              letterSpacing: "0.02em",
              fontFamily:
                "'Times New Roman', 'Cormorant Garamond', 'Cinzel', serif",
              background: dark
                ? "linear-gradient(90deg, #f7dfa1 0%, #f0bb4e 45%, #d8951f 100%)"
                : "linear-gradient(90deg, #b7790f 0%, #d69c1b 45%, #8c5a00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Focus Trax
          </h1>

          <p
            className="mt-1 uppercase"
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.32em",
              color: dark ? "#cbd5e1" : "#64748b",
              fontWeight: 700,
            }}
          >
            Focus Intelligence
          </p>
        </div>
      )}
    </div>
  );
}

export default FocusFlowLogo;