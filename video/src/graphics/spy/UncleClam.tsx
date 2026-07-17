import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Uncle Clam: googly-eyed clam in a comically oversized Uncle Sam hat.
 * Faces right and chomps like Pacman — both shells pivot at a rear hinge.
 * Chomps continuously while racing; `gobble` cranks the jaw wide open.
 */
export const UncleClam: React.FC<{
  size?: number;
  /** 0 closed → 1 wide open for gobbling */
  gobble?: number;
  /** Wiggle + auto-chomp while racing */
  racing?: boolean;
}> = ({ size = 220, gobble = 0, racing = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bounce = racing ? Math.abs(Math.sin(t * Math.PI * 2 * 4)) * 12 : 0;
  const lean = racing ? Math.sin(t * Math.PI * 2 * 4) * 5 : 0;
  const eyeJiggle = Math.sin(t * 18) * 2;

  // Pacman chomp: constant chatter while racing, jaw gapes with gobble.
  const chompCycle = racing ? (Math.sin(t * Math.PI * 2 * 3.2) + 1) / 2 : 0;
  const jaw = 6 + chompCycle * 14 + gobble * 26; // degrees each shell pivots

  // Rear hinge both shells rotate around (left side; mouth opens to the right)
  const HX = 45;
  const HY = 130;

  return (
    <div
      style={{
        width: size,
        height: size * 1.25,
        transform: `translateY(${-bounce}px) rotate(${lean}deg)`,
        filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.45))",
      }}
    >
      <svg viewBox="0 0 240 290" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Mouth cavity behind the shells */}
        <path
          d={`M ${HX} ${HY} L 215 ${HY - jaw * 1.6} L 215 ${HY + jaw * 1.6} Z`}
          fill="#5a2030"
          opacity={0.25 + (jaw / 46) * 0.65}
        />

        {/* Lower shell — Pacman jaw, pivots down */}
        <g transform={`rotate(${jaw} ${HX} ${HY})`}>
          <path
            d="M 45 130 L 210 130 Q 205 175 165 195 Q 115 215 70 190 Q 42 168 45 130 Z"
            fill="#d4a574"
            stroke="#8a5f3a"
            strokeWidth={5}
          />
          <path d="M 60 165 Q 110 185 175 165" fill="none" stroke="#b8895a" strokeWidth={3} />
          <path d="M 55 148 Q 110 165 190 148" fill="none" stroke="#b8895a" strokeWidth={3} />
          {/* Tiny American bowtie under the chin */}
          <path d="M 108 200 L 120 192 L 132 200 L 120 208 Z" fill="#c4302b" stroke="#8a1a18" strokeWidth={2} />
        </g>

        {/* Upper shell — pivots up; hat + eyes ride along */}
        <g transform={`rotate(${-jaw} ${HX} ${HY})`}>
          <path
            d="M 45 130 L 210 130 Q 205 85 165 65 Q 115 45 70 70 Q 42 92 45 130 Z"
            fill="#e8c49a"
            stroke="#8a5f3a"
            strokeWidth={5}
          />
          <path d="M 60 95 Q 110 75 175 95" fill="none" stroke="#c9a070" strokeWidth={3} />
          <path d="M 55 112 Q 110 95 190 112" fill="none" stroke="#c9a070" strokeWidth={3} />

          {/* Googly eyes on the top shell */}
          <g transform={`translate(0, ${eyeJiggle})`}>
            <circle cx={110} cy={72} r={24} fill="#fff" stroke="#2a2a2a" strokeWidth={4} />
            <circle cx={160} cy={72} r={24} fill="#fff" stroke="#2a2a2a" strokeWidth={4} />
            <circle cx={114 + Math.sin(t * 7) * 5} cy={76} r={10} fill="#1a1a1a" />
            <circle cx={164 + Math.cos(t * 6) * 5} cy={75} r={10} fill="#1a1a1a" />
            <circle cx={116} cy={72} r={3.5} fill="#fff" />
            <circle cx={166} cy={71} r={3.5} fill="#fff" />
          </g>

          {/* Comically oversized Uncle Sam hat, cocked back */}
          <g transform="rotate(-8 130 40)">
            {/* Huge brim */}
            <ellipse cx={130} cy={42} rx={78} ry={16} fill="#1a1a2e" stroke="#0a0a14" strokeWidth={4} />
            {/* Towering striped crown, slightly flared at the top */}
            <path
              d="M 92 42 L 84 -75 Q 130 -92 176 -75 L 168 42 Z"
              fill="#f2f0ea"
              stroke="#1a1a2e"
              strokeWidth={4}
            />
            {/* Red stripes fanning with the flare */}
            <path d="M 101 40 L 96 -78 L 110 -81 L 113 40 Z" fill="#c4302b" />
            <path d="M 124 40 L 123 -84 L 137 -84 L 136 40 Z" fill="#c4302b" />
            <path d="M 147 40 L 150 -81 L 164 -78 L 159 40 Z" fill="#c4302b" />
            {/* Big blue star band */}
            <path d="M 90 42 L 88 8 L 172 8 L 170 42 Z" fill="#1e3a8a" stroke="#1a1a2e" strokeWidth={3} />
            {/* Chunky stars on the band */}
            {[104, 130, 156].map((sx) => (
              <path
                key={sx}
                d={`M ${sx} 16 l 3.2 7 l 7.6 0.8 l -5.6 5.2 l 1.6 7.5 l -6.8 -3.9 l -6.8 3.9 l 1.6 -7.5 l -5.6 -5.2 l 7.6 -0.8 z`}
                fill="#fff"
              />
            ))}
            {/* Top flare highlight */}
            <path d="M 84 -75 Q 130 -92 176 -75" fill="none" stroke="#1a1a2e" strokeWidth={4} />
          </g>
        </g>
      </svg>
    </div>
  );
};
