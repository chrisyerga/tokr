import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/** Banded purple-and-orange gas giant with a big tilted ring and a storm spot. */
export const ExoplanetGasGiant: React.FC<{ size?: number }> = ({ size = 340 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = Math.sin(t * Math.PI * 2 * 0.2 + 1.3) * 9;
  const tilt = Math.sin(t * Math.PI * 2 * 0.12) * 3;
  const r = size * 0.36;
  const c = size / 2;
  const ringRx = r * 1.85;
  const ringStroke = 13;
  // Rings extend past the planet square — pad the SVG so tips aren't clipped.
  const pad = Math.max(0, Math.ceil(ringRx + ringStroke - size / 2) + 4);
  const vb = size + pad * 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "visible",
        transform: `translateY(${bob}px) rotate(${tilt}deg)`,
      }}
    >
      <svg
        viewBox={`${-pad} ${-pad} ${vb} ${vb}`}
        width={vb}
        height={vb}
        style={{
          position: "absolute",
          left: -pad,
          top: -pad,
          overflow: "visible",
          // Filter on the SVG (not the box) so ring tips aren't clipped.
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
        }}
      >
        <defs>
          <radialGradient id="gasG" cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#c58bf0" />
            <stop offset="60%" stopColor="#8b5bc4" />
            <stop offset="100%" stopColor="#4a2a78" />
          </radialGradient>
          <clipPath id="gasClip">
            <circle cx={c} cy={c} r={r} />
          </clipPath>
        </defs>

        {/* Ring behind */}
        <ellipse
          cx={c}
          cy={c}
          rx={ringRx}
          ry={r * 0.42}
          fill="none"
          stroke="#f2c14e"
          strokeWidth={ringStroke}
          opacity={0.9}
          transform={`rotate(-18 ${c} ${c})`}
        />
        <ellipse
          cx={c}
          cy={c}
          rx={r * 1.55}
          ry={r * 0.34}
          fill="none"
          stroke="#ffe1a1"
          strokeWidth={6}
          opacity={0.7}
          transform={`rotate(-18 ${c} ${c})`}
        />

        {/* Planet */}
        <circle cx={c} cy={c} r={r} fill="url(#gasG)" stroke="#2e1a4d" strokeWidth={6} />

        {/* Bands (drift slowly sideways) */}
        <g clipPath="url(#gasClip)" opacity={0.75}>
          <ellipse cx={c + Math.sin(t * 0.5) * 8} cy={c - r * 0.45} rx={r * 1.1} ry={r * 0.14} fill="#e8a86a" />
          <ellipse cx={c - Math.sin(t * 0.4) * 10} cy={c - r * 0.05} rx={r * 1.15} ry={r * 0.17} fill="#f0c58f" />
          <ellipse cx={c + Math.sin(t * 0.45 + 1) * 9} cy={c + r * 0.4} rx={r * 1.1} ry={r * 0.13} fill="#d98f56" />
          {/* Storm spot */}
          <ellipse cx={c + r * 0.35} cy={c + r * 0.12} rx={r * 0.22} ry={r * 0.13} fill="#c4502e" stroke="#7d2c14" strokeWidth={4} />
        </g>

        {/* Ring front arc */}
        <path
          d={`M ${c - r * 1.83} ${c + r * 0.36} A ${ringRx} ${r * 0.42} -18 0 0 ${c + r * 1.8} ${c - r * 0.22}`}
          fill="none"
          stroke="#f2c14e"
          strokeWidth={ringStroke}
          opacity={0.95}
        />
      </svg>
    </div>
  );
};
