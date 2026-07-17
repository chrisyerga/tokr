import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BANDS = [
  { label: "Oxygen", color: "#5CFFB0", xFrac: 0.22 },
  { label: "Nitrogen", color: "#7EB6FF", xFrac: 0.48 },
  { label: "Your dog's farts", color: "#FF8C42", xFrac: 0.74 },
];

export const Spectroscopy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const starX = width * 0.18;
  const starY = height * 0.42;
  const prismX = width * 0.42;
  const prismY = height * 0.42;
  const spectrumY = height * 0.42;
  const spectrumStart = width * 0.55;
  const spectrumEnd = width * 0.92;

  const phase = (t % 6) / 6; // 0..1 loop
  const beamProgress = interpolate(phase, [0, 0.25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const spectrumProgress = interpolate(phase, [0.2, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelsProgress = interpolate(phase, [0.45, 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const filterProgress = interpolate(phase, [0.65, 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rainbowStops = [
    "#ff0040",
    "#ff7a00",
    "#ffee00",
    "#00dd66",
    "#0088ff",
    "#6a2cff",
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, #1a1030 0%, #080612 60%, #020208 100%)",
      }}
    >
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            {rainbowStops.map((c, i) => (
              <stop
                key={c}
                offset={`${(i / (rainbowStops.length - 1)) * 100}%`}
                stopColor={c}
              />
            ))}
          </linearGradient>
          <radialGradient id="starG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8d0" />
            <stop offset="50%" stopColor="#ffcc66" />
            <stop offset="100%" stopColor="#ffcc66" stopOpacity={0} />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text
          x={width / 2}
          y={130}
          textAnchor="middle"
          fill="#fff"
          fontSize={48}
          fontWeight={800}
          fontFamily="Montserrat, Arial Black, sans-serif"
          stroke="#000"
          strokeWidth={6}
          paintOrder="stroke"
        >
          SPECTROSCOPY
        </text>
        <text
          x={width / 2}
          y={185}
          textAnchor="middle"
          fill="#FFD400"
          fontSize={28}
          fontWeight={700}
          fontFamily="Montserrat, Arial, sans-serif"
        >
          Reading an exoplanet&apos;s atmosphere
        </text>

        {/* Star */}
        <circle cx={starX} cy={starY} r={90} fill="url(#starG)" />
        <circle cx={starX} cy={starY} r={36} fill="#ffe9a0" />

        {/* Small planet silhouette near star */}
        <circle
          cx={starX + 55}
          cy={starY + 10}
          r={14}
          fill="#2a3550"
          stroke="#8ab4ff"
          strokeWidth={2}
        />

        {/* White light beam into prism */}
        <line
          x1={starX + 40}
          y1={starY}
          x2={starX + 40 + (prismX - 40 - starX) * beamProgress}
          y2={starY}
          stroke="rgba(255,255,240,0.85)"
          strokeWidth={10}
          strokeLinecap="round"
          filter="url(#softGlow)"
        />

        {/* Prism */}
        <polygon
          points={`${prismX - 50},${prismY + 70} ${prismX + 50},${prismY + 70} ${prismX},${prismY - 70}`}
          fill="rgba(200,230,255,0.25)"
          stroke="#cfe8ff"
          strokeWidth={3}
        />
        <text
          x={prismX}
          y={prismY + 110}
          textAnchor="middle"
          fill="#cfe8ff"
          fontSize={24}
          fontWeight={700}
          fontFamily="Montserrat, Arial, sans-serif"
        >
          PRISM
        </text>

        {/* Rainbow spectrum fan */}
        {spectrumProgress > 0 && (
          <g opacity={spectrumProgress}>
            <polygon
              points={`${prismX + 20},${prismY} ${spectrumEnd},${spectrumY - 90 * spectrumProgress} ${spectrumEnd},${spectrumY + 90 * spectrumProgress}`}
              fill="url(#rainbow)"
              opacity={0.85}
            />
            {/* Absorption black bars */}
            {BANDS.map((b) => {
              const bx = spectrumStart + (spectrumEnd - spectrumStart) * b.xFrac;
              const h = 160 * filterProgress;
              return (
                <g key={b.label}>
                  <rect
                    x={bx - 6}
                    y={spectrumY - h / 2}
                    width={12}
                    height={h}
                    fill="#000"
                    opacity={0.85 * filterProgress}
                  />
                  <g opacity={labelsProgress}>
                    <line
                      x1={bx}
                      y1={spectrumY + 100}
                      x2={bx}
                      y2={spectrumY + 140}
                      stroke={b.color}
                      strokeWidth={3}
                    />
                    <rect
                      x={bx - 90}
                      y={spectrumY + 145}
                      width={180}
                      height={44}
                      rx={10}
                      fill="rgba(0,0,0,0.7)"
                      stroke={b.color}
                      strokeWidth={3}
                    />
                    <text
                      x={bx}
                      y={spectrumY + 175}
                      textAnchor="middle"
                      fill={b.color}
                      fontSize={b.label.length > 12 ? 18 : 22}
                      fontWeight={800}
                      fontFamily="Montserrat, Arial Black, sans-serif"
                    >
                      {b.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}

        <text
          x={width / 2}
          y={height - 140}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={30}
          fontWeight={700}
          fontFamily="Montserrat, Arial, sans-serif"
          stroke="#000"
          strokeWidth={4}
          paintOrder="stroke"
        >
          Missing colors = chemicals in the air
        </text>
      </svg>
    </AbsoluteFill>
  );
};
