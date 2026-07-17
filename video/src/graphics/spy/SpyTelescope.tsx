import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Spy-disguised space telescope: RomanTelescope silhouette with
 * sunglasses + fedora. When disguised=false, the disguise flies off.
 */
export const SpyTelescope: React.FC<{
  size?: number;
  disguised?: boolean;
  /** 0–1 progress of disguise shedding (overrides disguised snap). */
  shedProgress?: number;
  bob?: boolean;
}> = ({ size = 200, disguised = true, shedProgress, bob = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bobY = bob ? Math.sin(t * Math.PI * 2 * 0.5) * 8 : 0;
  const tilt = bob ? Math.sin(t * Math.PI * 2 * 0.3) * 3 : 0;
  const twinkle = (Math.sin(t * Math.PI * 2 * 1.4) + 1) / 2;

  const shed =
    shedProgress !== undefined
      ? shedProgress
      : disguised
        ? 0
        : 1;
  const disguiseOpacity = interpolate(shed, [0, 0.35], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hatY = interpolate(shed, [0, 1], [0, -80]);
  const hatRot = interpolate(shed, [0, 1], [0, -35]);
  const glassesY = interpolate(shed, [0, 1], [0, 90]);
  const glassesX = interpolate(shed, [0, 1], [0, 40]);

  return (
    <div
      style={{
        width: size,
        height: size * 0.62,
        transform: `translateY(${bobY}px) rotate(${tilt}deg)`,
        filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox="0 0 400 250" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Solar panel left */}
        <g transform="translate(20, 105)">
          <rect x={0} y={0} width={80} height={50} rx={6} fill="#2a5fc4" stroke="#0e2f6e" strokeWidth={4} />
          <line x1={27} y1={2} x2={27} y2={48} stroke="#0e2f6e" strokeWidth={3} />
          <line x1={54} y1={2} x2={54} y2={48} stroke="#0e2f6e" strokeWidth={3} />
          <line x1={2} y1={25} x2={78} y2={25} stroke="#0e2f6e" strokeWidth={3} />
        </g>
        {/* Solar panel right */}
        <g transform="translate(300, 105)">
          <rect x={0} y={0} width={80} height={50} rx={6} fill="#2a5fc4" stroke="#0e2f6e" strokeWidth={4} />
          <line x1={27} y1={2} x2={27} y2={48} stroke="#0e2f6e" strokeWidth={3} />
          <line x1={54} y1={2} x2={54} y2={48} stroke="#0e2f6e" strokeWidth={3} />
          <line x1={2} y1={25} x2={78} y2={25} stroke="#0e2f6e" strokeWidth={3} />
        </g>
        <line x1={100} y1={130} x2={140} y2={130} stroke="#8a93a6" strokeWidth={6} />
        <line x1={260} y1={130} x2={300} y2={130} stroke="#8a93a6" strokeWidth={6} />

        {/* Sunshade */}
        <ellipse cx={200} cy={185} rx={95} ry={38} fill="#d8a13a" stroke="#8a5f14" strokeWidth={5} />
        <ellipse cx={200} cy={175} rx={95} ry={38} fill="#f2c14e" stroke="#8a5f14" strokeWidth={5} />

        {/* Barrel */}
        <rect x={140} y={45} width={120} height={135} rx={18} fill="#e8ecf4" stroke="#7a8499" strokeWidth={6} />
        <rect x={140} y={45} width={120} height={26} rx={13} fill="#aab4c8" stroke="#7a8499" strokeWidth={6} />

        {/* Aperture */}
        <circle cx={200} cy={58} r={30} fill="#182742" stroke="#7a8499" strokeWidth={6} />
        <circle cx={191} cy={50} r={9} fill="#9fd4ff" opacity={0.5 + twinkle * 0.5} />

        {/* Cute face (visible when de-spied) */}
        <g opacity={interpolate(shed, [0.3, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <circle cx={178} cy={120} r={7} fill="#182742" />
          <circle cx={222} cy={120} r={7} fill="#182742" />
          <path d="M 182 145 Q 200 160 218 145" fill="none" stroke="#182742" strokeWidth={6} strokeLinecap="round" />
        </g>

        {/* Sunglasses */}
        <g
          opacity={disguiseOpacity}
          transform={`translate(${glassesX}, ${glassesY})`}
        >
          <rect x={160} y={108} width={36} height={22} rx={5} fill="#141821" stroke="#0a0c10" strokeWidth={3} />
          <rect x={204} y={108} width={36} height={22} rx={5} fill="#141821" stroke="#0a0c10" strokeWidth={3} />
          <line x1={196} y1={118} x2={204} y2={118} stroke="#141821" strokeWidth={5} />
          <line
            x1={164 + twinkle * 14}
            y1={124}
            x2={172 + twinkle * 14}
            y2={112}
            stroke="#9fd4ff"
            strokeWidth={3}
            opacity={0.75}
          />
        </g>

        {/* Fedora */}
        <g
          opacity={disguiseOpacity}
          transform={`translate(0, ${hatY}) rotate(${hatRot} 200 40)`}
        >
          <ellipse cx={200} cy={42} rx={58} ry={12} fill="#3a3f4d" stroke="#20242e" strokeWidth={4} />
          <path d="M 168 42 Q 168 10 200 8 Q 232 10 232 42 Z" fill="#3a3f4d" stroke="#20242e" strokeWidth={4} />
          <rect x={168} y={32} width={64} height={8} fill="#20242e" />
        </g>

        {/* Antenna */}
        <line x1={258} y1={60} x2={288} y2={28} stroke="#8a93a6" strokeWidth={5} strokeLinecap="round" />
        <circle cx={292} cy={24} r={7} fill="#ff5d5d" opacity={0.4 + twinkle * 0.6} />
      </svg>
    </div>
  );
};
