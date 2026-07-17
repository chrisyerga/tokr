import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/** Pale icy exoplanet with frost caps, craters, and twinkling sparkles. */
export const ExoplanetIce: React.FC<{ size?: number }> = ({ size = 280 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = Math.sin(t * Math.PI * 2 * 0.22 + 2.4) * 7;
  const twinkle = (Math.sin(t * Math.PI * 2 * 1.1) + 1) / 2;
  const r = size * 0.4;
  const c = size / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `translateY(${bob}px)`,
        filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
        <defs>
          <radialGradient id="iceG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#eafcff" />
            <stop offset="55%" stopColor="#9fd8e8" />
            <stop offset="100%" stopColor="#4e8ba6" />
          </radialGradient>
          <clipPath id="iceClip">
            <circle cx={c} cy={c} r={r} />
          </clipPath>
        </defs>
        <circle cx={c} cy={c} r={r} fill="url(#iceG)" stroke="#2c5a70" strokeWidth={6} />
        <g clipPath="url(#iceClip)">
          {/* Frost caps */}
          <ellipse cx={c} cy={c - r * 0.92} rx={r * 0.75} ry={r * 0.32} fill="#ffffff" opacity={0.9} />
          <ellipse cx={c} cy={c + r * 0.95} rx={r * 0.65} ry={r * 0.28} fill="#ffffff" opacity={0.85} />
          {/* Craters */}
          <circle cx={c - r * 0.35} cy={c + r * 0.1} r={r * 0.14} fill="#7db9cc" stroke="#5a97ad" strokeWidth={3} />
          <circle cx={c + r * 0.3} cy={c - r * 0.25} r={r * 0.1} fill="#7db9cc" stroke="#5a97ad" strokeWidth={3} />
          <circle cx={c + r * 0.42} cy={c + r * 0.38} r={r * 0.08} fill="#7db9cc" stroke="#5a97ad" strokeWidth={3} />
        </g>
        {/* Sparkles */}
        <g opacity={twinkle}>
          <path d={`M ${c - r * 0.9} ${c - r * 0.8} l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z`} fill="#ffffff" />
        </g>
        <g opacity={1 - twinkle}>
          <path d={`M ${c + r * 0.95} ${c - r * 0.4} l 3 8 l 8 3 l -8 3 l -3 8 l -3 -8 l -8 -3 l 8 -3 z`} fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
