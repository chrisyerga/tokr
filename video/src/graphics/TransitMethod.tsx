import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  durationInFrames?: number;
};

function seededStars(count: number, seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 70,
    r: 0.6 + rand() * 2.2,
    a: 0.35 + rand() * 0.65,
  }));
}

export const TransitMethod: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const stars = useMemo(() => seededStars(120), []);

  // Orbital period ~4s; transit when planet crosses in front
  const period = 4;
  const angle = (t / period) * Math.PI * 2 - Math.PI / 2;
  const orbitRx = 220;
  const orbitRy = 70;
  const cx = width / 2;
  const cy = height * 0.38;
  const planetX = cx + Math.cos(angle) * orbitRx;
  const planetY = cy + Math.sin(angle) * orbitRy;
  // In front when sin is positive (bottom of ellipse toward camera) — use depth
  const depth = Math.sin(angle); // -1 behind, +1 in front
  const inFront = depth > 0;

  // Luminance dip when planet is near center and in front
  const transitProximity = Math.exp(-Math.pow(Math.cos(angle) / 0.18, 2));
  const dip = inFront ? transitProximity * 0.28 : 0;
  const luminance = 1 - dip;

  // Graph history
  const graphW = width * 0.86;
  const graphH = 160;
  const graphX = (width - graphW) / 2;
  const graphY = height * 0.78;
  const samples = 90;
  const points: string[] = [];
  for (let i = 0; i < samples; i++) {
    const age = (samples - 1 - i) / fps; // seconds ago
    const pastT = t - age;
    const pastAngle = (pastT / period) * Math.PI * 2 - Math.PI / 2;
    const pastFront = Math.sin(pastAngle) > 0;
    const pastProx = Math.exp(-Math.pow(Math.cos(pastAngle) / 0.18, 2));
    const pastDip = pastFront ? pastProx * 0.28 : 0;
    const L = 1 - pastDip;
    const x = graphX + (i / (samples - 1)) * graphW;
    const y = graphY + graphH * 0.15 + (1 - L) * graphH * 0.7;
    points.push(`${x},${y}`);
  }

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #1a2744 0%, #070b16 55%, #02040a 100%)",
      }}
    >
      <svg width={width} height={height}>
        {stars.map((st, i) => (
          <circle
            key={i}
            cx={(st.x / 100) * width}
            cy={(st.y / 100) * height}
            r={st.r}
            fill={`rgba(255,255,255,${st.a})`}
          />
        ))}

        {/* Orbit path */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={orbitRx}
          ry={orbitRy}
          fill="none"
          stroke="rgba(120,180,255,0.25)"
          strokeWidth={2}
          strokeDasharray="6 8"
        />

        {/* Star behind planet when in front */}
        {!inFront && (
          <circle
            cx={planetX}
            cy={planetY}
            r={28}
            fill="#3d5a80"
            stroke="#7eb6ff"
            strokeWidth={2}
          />
        )}

        {/* Star glow */}
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8e0" />
            <stop offset="35%" stopColor="#ffd76a" />
            <stop offset="70%" stopColor="#ff9a3c" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#ff9a3c" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={interpolate(luminance, [0.72, 1], [95, 120])}
          fill="url(#starGlow)"
          opacity={0.85 * luminance}
        />
        <circle
          cx={cx}
          cy={cy}
          r={48}
          fill={`rgb(${255 * luminance}, ${220 * luminance}, ${120 * luminance})`}
        />

        {inFront && (
          <circle
            cx={planetX}
            cy={planetY}
            r={28}
            fill="#2a3f5f"
            stroke="#9ec9ff"
            strokeWidth={2}
          />
        )}

        {/* Title */}
        <text
          x={width / 2}
          y={120}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={52}
          fontWeight={800}
          fontFamily="Montserrat, Arial Black, sans-serif"
          style={{
            paintOrder: "stroke",
            stroke: "#000",
            strokeWidth: 6,
          }}
        >
          TRANSIT METHOD
        </text>

        {/* Graph frame */}
        <rect
          x={graphX}
          y={graphY}
          width={graphW}
          height={graphH}
          rx={12}
          fill="rgba(0,0,0,0.45)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={2}
        />
        <text
          x={graphX + 16}
          y={graphY - 16}
          fill="#FFD400"
          fontSize={28}
          fontWeight={700}
          fontFamily="Montserrat, Arial, sans-serif"
        >
          Star brightness
        </text>
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#5CFFB0"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Current marker */}
        <circle
          cx={graphX + graphW}
          cy={graphY + graphH * 0.15 + (1 - luminance) * graphH * 0.7}
          r={8}
          fill="#FFD400"
        />
      </svg>
    </AbsoluteFill>
  );
};
