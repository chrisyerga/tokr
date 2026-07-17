import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Figure = {
  angleDeg: number;
  popAt: number;
  scale: number;
  wave: boolean;
};

const FIGURES: Figure[] = [
  { angleDeg: -55, popAt: 0.5, scale: 1, wave: true },
  { angleDeg: -10, popAt: 0.9, scale: 0.85, wave: false },
  { angleDeg: 30, popAt: 1.3, scale: 1.05, wave: true },
  { angleDeg: 70, popAt: 1.7, scale: 0.9, wave: false },
  { angleDeg: -90, popAt: 2.1, scale: 0.95, wave: true },
];

export const StickFigure: React.FC<{ wavePhase: number; waving: boolean }> = ({
  wavePhase,
  waving,
}) => {
  const armAngle = waving ? Math.sin(wavePhase * Math.PI * 2 * 1.6) * 35 : 20;
  return (
    <svg viewBox="0 0 40 60" width={40} height={60}>
      {/* head */}
      <circle cx={20} cy={10} r={8} fill="none" stroke="#f8f4e8" strokeWidth={4} />
      {/* body */}
      <line x1={20} y1={18} x2={20} y2={40} stroke="#f8f4e8" strokeWidth={4} strokeLinecap="round" />
      {/* legs */}
      <line x1={20} y1={40} x2={11} y2={56} stroke="#f8f4e8" strokeWidth={4} strokeLinecap="round" />
      <line x1={20} y1={40} x2={29} y2={56} stroke="#f8f4e8" strokeWidth={4} strokeLinecap="round" />
      {/* left arm */}
      <line x1={20} y1={24} x2={8} y2={32} stroke="#f8f4e8" strokeWidth={4} strokeLinecap="round" />
      {/* right arm — waves */}
      <line
        x1={20}
        y1={24}
        x2={20 + 14 * Math.cos((-armAngle * Math.PI) / 180)}
        y2={24 - 14 * Math.sin((armAngle * Math.PI) / 180) - (waving ? 6 : 0)}
        stroke="#f8f4e8"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Cartoon exoplanet with rings; stick-figure settlers pop up around
 * the surface one by one and wave.
 */
export const ExoplanetLife: React.FC<{ size?: number }> = ({ size = 360 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const planetR = size * 0.32;
  const ringRx = planetR * 1.7;
  const ringStroke = 10;
  // Rings extend past the planet square — pad the SVG so tips aren't clipped.
  const pad = Math.max(0, Math.ceil(ringRx + ringStroke - size / 2) + 4);
  const vb = size + pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const spin = Math.sin(t * Math.PI * 2 * 0.18) * 4;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "visible",
        transform: `rotate(${spin}deg)`,
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
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.5))",
        }}
      >
        <defs>
          <radialGradient id="planetG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#8fe3a5" />
            <stop offset="55%" stopColor="#3fae7a" />
            <stop offset="100%" stopColor="#1d5e50" />
          </radialGradient>
        </defs>

        {/* Ring behind */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={ringRx}
          ry={planetR * 0.5}
          fill="none"
          stroke="#c9a2e8"
          strokeWidth={ringStroke}
          opacity={0.85}
          transform={`rotate(-14 ${cx} ${cy})`}
        />

        {/* Planet */}
        <circle cx={cx} cy={cy} r={planetR} fill="url(#planetG)" stroke="#134238" strokeWidth={6} />

        {/* Continents */}
        <ellipse cx={cx - 30} cy={cy - 18} rx={32} ry={20} fill="#67c98b" opacity={0.9} />
        <ellipse cx={cx + 34} cy={cy + 22} rx={26} ry={16} fill="#67c98b" opacity={0.9} />
        <ellipse cx={cx + 10} cy={cy - 42} rx={18} ry={11} fill="#67c98b" opacity={0.9} />

        {/* Little flag */}
        <g transform={`translate(${cx + planetR * 0.55}, ${cy - planetR * 0.75})`}>
          <line x1={0} y1={0} x2={0} y2={-28} stroke="#5b4632" strokeWidth={4} />
          <path d="M 0 -28 L 22 -22 L 0 -14 Z" fill="#ff5d5d" stroke="#a33" strokeWidth={2} />
        </g>

        {/* Ring front arc */}
        <path
          d={`M ${cx - ringRx} ${cy + planetR * 0.18} A ${ringRx} ${planetR * 0.5} -14 0 0 ${cx + planetR * 1.66} ${cy + planetR * 0.32}`}
          fill="none"
          stroke="#dcbaf5"
          strokeWidth={ringStroke}
          opacity={0.95}
        />
      </svg>

      {/* Stick figures around the rim */}
      {FIGURES.map((f, i) => {
        const pop = interpolate(t, [f.popAt, f.popAt + 0.35], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rad = ((f.angleDeg - 90) * Math.PI) / 180;
        const fx = cx + Math.cos(rad) * planetR;
        const fy = cy + Math.sin(rad) * planetR;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: fx - 20,
              top: fy - 56,
              transformOrigin: "50% 100%",
              transform: `rotate(${f.angleDeg}deg) scale(${pop * f.scale})`,
              opacity: pop,
            }}
          >
            <StickFigure wavePhase={t + i * 0.4} waving={f.wave} />
          </div>
        );
      })}
    </div>
  );
};
