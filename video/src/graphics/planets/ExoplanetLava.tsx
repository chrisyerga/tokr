import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/** Molten rocky exoplanet: dark crust with pulsing lava cracks. */
export const ExoplanetLava: React.FC<{ size?: number }> = ({ size = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const pulse = 0.55 + 0.45 * ((Math.sin(t * Math.PI * 2 * 0.7) + 1) / 2);
  const bob = Math.sin(t * Math.PI * 2 * 0.25) * 8;
  const r = size * 0.42;
  const c = size / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `translateY(${bob}px)`,
        filter: `drop-shadow(0 0 ${18 * pulse}px rgba(255,110,40,0.7)) drop-shadow(0 8px 14px rgba(0,0,0,0.5))`,
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
        <defs>
          <radialGradient id="lavaG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#b06a4a" />
            <stop offset="55%" stopColor="#7d4030" />
            <stop offset="100%" stopColor="#3d1c15" />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="url(#lavaG)" stroke="#2a1109" strokeWidth={6} />
        {/* Lava cracks */}
        <g stroke="#ff8c2d" strokeLinecap="round" fill="none" opacity={0.75 + pulse * 0.25}>
          <path d={`M ${c - r * 0.7} ${c - r * 0.1} Q ${c - r * 0.2} ${c + r * 0.15} ${c + r * 0.3} ${c - r * 0.05} T ${c + r * 0.8} ${c + r * 0.1}`} strokeWidth={10} />
          <path d={`M ${c - r * 0.4} ${c + r * 0.45} Q ${c} ${c + r * 0.3} ${c + r * 0.45} ${c + r * 0.55}`} strokeWidth={8} />
          <path d={`M ${c - r * 0.25} ${c - r * 0.6} Q ${c + r * 0.05} ${c - r * 0.4} ${c + r * 0.05} ${c - r * 0.15}`} strokeWidth={7} />
        </g>
        {/* Hot cores of the cracks */}
        <g stroke="#ffd98a" strokeLinecap="round" fill="none" opacity={pulse}>
          <path d={`M ${c - r * 0.7} ${c - r * 0.1} Q ${c - r * 0.2} ${c + r * 0.15} ${c + r * 0.3} ${c - r * 0.05} T ${c + r * 0.8} ${c + r * 0.1}`} strokeWidth={4} />
          <path d={`M ${c - r * 0.4} ${c + r * 0.45} Q ${c} ${c + r * 0.3} ${c + r * 0.45} ${c + r * 0.55}`} strokeWidth={3} />
        </g>
        {/* Glow spots */}
        <circle cx={c + r * 0.35} cy={c + r * 0.05} r={9} fill="#ffb15c" opacity={pulse} />
        <circle cx={c - r * 0.45} cy={c - r * 0.05} r={6} fill="#ffb15c" opacity={pulse * 0.8} />
        {/* Ember particles */}
        <circle cx={c + r * 0.6} cy={c - r * 0.75 - (t * 30) % 40} r={4} fill="#ff9b45" opacity={0.7 * pulse} />
        <circle cx={c - r * 0.55} cy={c - r * 0.85 - (t * 22 + 15) % 40} r={3} fill="#ffce8a" opacity={0.6 * pulse} />
      </svg>
    </div>
  );
};
