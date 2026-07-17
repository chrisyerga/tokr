import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SpySatellite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const earthCx = width / 2;
  const earthCy = height * 0.48;
  const earthR = 280;

  // Satellite orbits
  const satAngle = t * 0.7;
  const satOrbit = earthR + 110;
  const satX = earthCx + Math.cos(satAngle) * satOrbit;
  const satY = earthCy + Math.sin(satAngle) * satOrbit * 0.55;

  // Bad guy position on globe (fixed lat/lon-ish)
  const badGuyAngle = -0.6;
  const badGuyX = earthCx + Math.cos(badGuyAngle) * earthR * 0.72;
  const badGuyY = earthCy + Math.sin(badGuyAngle) * earthR * 0.55 - 20;

  // Scan / laser cycle every ~3.5s
  const cycle = ((t % 3.5) + 3.5) % 3.5;
  const locking = cycle > 1.2 && cycle < 2.0;
  const firing = cycle >= 2.0 && cycle < 2.6;
  const boom = cycle >= 2.6 && cycle < 3.2;

  const laserOpacity = firing
    ? interpolate(cycle, [2.0, 2.1, 2.5, 2.6], [0, 1, 1, 0])
    : 0;

  const continents = useMemo(
    () => [
      { x: -80, y: -40, w: 90, h: 50 },
      { x: 40, y: 10, w: 70, h: 40 },
      { x: -20, y: 60, w: 55, h: 35 },
      { x: 90, y: -70, w: 45, h: 30 },
    ],
    [],
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #0b1e3a 0%, #020814 70%, #000 100%)",
      }}
    >
      <svg width={width} height={height}>
        <defs>
          <radialGradient id="earthGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4db8ff" />
            <stop offset="55%" stopColor="#1a6fb5" />
            <stop offset="100%" stopColor="#0a2a4a" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text
          x={width / 2}
          y={140}
          textAnchor="middle"
          fill="#fff"
          fontSize={48}
          fontWeight={800}
          fontFamily="Montserrat, Arial Black, sans-serif"
          stroke="#000"
          strokeWidth={6}
          paintOrder="stroke"
        >
          NRO SPY SATELLITE
        </text>

        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <circle
            key={i}
            cx={((i * 97) % width)}
            cy={((i * 53) % (height * 0.9))}
            r={(i % 3) + 0.5}
            fill="rgba(255,255,255,0.5)"
          />
        ))}

        {/* Earth */}
        <circle cx={earthCx} cy={earthCy} r={earthR} fill="url(#earthGrad)" />
        {continents.map((c, i) => (
          <ellipse
            key={i}
            cx={earthCx + c.x}
            cy={earthCy + c.y}
            rx={c.w}
            ry={c.h}
            fill="#3d9e5a"
            opacity={0.85}
          />
        ))}
        <circle
          cx={earthCx}
          cy={earthCy}
          r={earthR}
          fill="none"
          stroke="rgba(180,230,255,0.35)"
          strokeWidth={4}
        />

        {/* Bad guy (comical) */}
        <g transform={`translate(${badGuyX}, ${badGuyY})`}>
          {/* body */}
          <rect x={-18} y={-8} width={36} height={40} rx={8} fill="#222" />
          {/* head */}
          <circle cx={0} cy={-28} r={18} fill="#f0c8a0" />
          {/* mask */}
          <rect x={-16} y={-34} width={32} height={14} rx={4} fill="#111" />
          <circle cx={-6} cy={-27} r={3} fill="#ff3333" />
          <circle cx={6} cy={-27} r={3} fill="#ff3333" />
          {/* top hat */}
          <rect x={-14} y={-52} width={28} height={10} fill="#111" />
          <rect x={-20} y={-44} width={40} height={6} fill="#111" />
          {/* label */}
          <text
            y={50}
            textAnchor="middle"
            fill="#FFD400"
            fontSize={22}
            fontWeight={800}
            fontFamily="Montserrat, Arial Black, sans-serif"
            stroke="#000"
            strokeWidth={4}
            paintOrder="stroke"
          >
            BAD GUY
          </text>
          {locking && (
            <circle
              cx={0}
              cy={-10}
              r={48 + Math.sin(t * 20) * 4}
              fill="none"
              stroke="#ff3333"
              strokeWidth={3}
              strokeDasharray="8 6"
            />
          )}
          {boom && (
            <g>
              <text
                y={-70}
                textAnchor="middle"
                fontSize={36}
                fill="#FFD400"
                fontWeight={900}
              >
                💥 POW!
              </text>
            </g>
          )}
        </g>

        {/* Scan cone from satellite */}
        {locking && (
          <polygon
            points={`${satX},${satY} ${badGuyX - 40},${badGuyY} ${badGuyX + 40},${badGuyY}`}
            fill="rgba(255,80,80,0.15)"
            stroke="rgba(255,80,80,0.5)"
            strokeWidth={2}
          />
        )}

        {/* Laser */}
        {firing && (
          <line
            x1={satX}
            y1={satY}
            x2={badGuyX}
            y2={badGuyY - 10}
            stroke="#ff2244"
            strokeWidth={6}
            opacity={laserOpacity}
            filter="url(#glow)"
          />
        )}

        {/* Satellite */}
        <g transform={`translate(${satX}, ${satY}) rotate(${(satAngle * 180) / Math.PI})`}>
          <rect x={-22} y={-10} width={44} height={20} rx={4} fill="#d0d6e0" />
          <rect x={-50} y={-6} width={24} height={12} fill="#3a7cff" />
          <rect x={26} y={-6} width={24} height={12} fill="#3a7cff" />
          <circle cx={0} cy={0} r={5} fill="#ff5555" />
          <line x1={0} y1={-10} x2={0} y2={-28} stroke="#aaa" strokeWidth={3} />
          <circle cx={0} cy={-30} r={4} fill="#ffe066" />
        </g>

        <text
          x={width / 2}
          y={height - 160}
          textAnchor="middle"
          fill="#9ec9ff"
          fontSize={32}
          fontWeight={700}
          fontFamily="Montserrat, Arial, sans-serif"
        >
          (retired spy tech → space telescope)
        </text>
      </svg>
    </AbsoluteFill>
  );
};
