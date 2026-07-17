import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/** Cartoon Earth: blue oceans, green continents, drifting clouds. */
export const Earth: React.FC<{ size?: number }> = ({ size = 320 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = Math.sin(t * Math.PI * 2 * 0.2) * 7;
  const cloudDrift = Math.sin(t * Math.PI * 2 * 0.15) * 12;
  const r = size * 0.42;
  const c = size / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `translateY(${bob}px)`,
        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
        <defs>
          <radialGradient id="earthG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#7ec8f0" />
            <stop offset="55%" stopColor="#3a8fd4" />
            <stop offset="100%" stopColor="#1a4e8c" />
          </radialGradient>
          <clipPath id="earthClip">
            <circle cx={c} cy={c} r={r} />
          </clipPath>
        </defs>
        <circle cx={c} cy={c} r={r} fill="url(#earthG)" stroke="#123a66" strokeWidth={6} />
        <g clipPath="url(#earthClip)">
          {/* Continents */}
          <path
            d={`M ${c - r * 0.9} ${c - r * 0.3} q ${r * 0.4} ${-r * 0.35} ${r * 0.75} ${-r * 0.1} q ${r * 0.3} ${r * 0.2} ${r * 0.05} ${r * 0.45} q ${-r * 0.35} ${r * 0.25} ${-r * 0.6} ${r * 0.05} q ${-r * 0.3} ${-r * 0.15} ${-r * 0.2} ${-r * 0.4} z`}
            fill="#5cb85c"
            stroke="#3a7d3a"
            strokeWidth={4}
          />
          <path
            d={`M ${c + r * 0.15} ${c + r * 0.15} q ${r * 0.35} ${-r * 0.15} ${r * 0.55} ${r * 0.1} q ${r * 0.15} ${r * 0.25} ${-r * 0.05} ${r * 0.45} q ${-r * 0.35} ${r * 0.15} ${-r * 0.5} ${-r * 0.1} q ${-r * 0.1} ${-r * 0.3} 0 ${-r * 0.45} z`}
            fill="#5cb85c"
            stroke="#3a7d3a"
            strokeWidth={4}
          />
          <ellipse cx={c + r * 0.45} cy={c - r * 0.55} rx={r * 0.28} ry={r * 0.16} fill="#5cb85c" stroke="#3a7d3a" strokeWidth={4} />
          {/* Clouds */}
          <g opacity={0.85} transform={`translate(${cloudDrift}, 0)`}>
            <ellipse cx={c - r * 0.3} cy={c - r * 0.65} rx={r * 0.32} ry={r * 0.1} fill="#ffffff" />
            <ellipse cx={c + r * 0.5} cy={c + r * 0.05} rx={r * 0.26} ry={r * 0.08} fill="#ffffff" />
            <ellipse cx={c - r * 0.45} cy={c + r * 0.5} rx={r * 0.3} ry={r * 0.09} fill="#ffffff" />
          </g>
        </g>
        {/* Atmosphere rim */}
        <circle cx={c} cy={c} r={r + 7} fill="none" stroke="#9fd4ff" strokeWidth={4} opacity={0.5} />
      </svg>
    </div>
  );
};
