import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Cartoon Nancy Grace Roman space telescope: stubby barrel, big sunshade,
 * solar panels, gently bobbing and tilting like it's floating in orbit.
 */
export const RomanTelescope: React.FC<{ size?: number }> = ({ size = 380 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = Math.sin(t * Math.PI * 2 * 0.5) * 10;
  const tilt = Math.sin(t * Math.PI * 2 * 0.3) * 4;
  const twinkle = (Math.sin(t * Math.PI * 2 * 1.4) + 1) / 2;

  return (
    <div
      style={{
        width: size,
        height: size * 0.62,
        transform: `translateY(${bob}px) rotate(${tilt}deg)`,
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox="0 0 400 250" width="100%" height="100%">
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
        {/* Struts */}
        <line x1={100} y1={130} x2={140} y2={130} stroke="#8a93a6" strokeWidth={6} />
        <line x1={260} y1={130} x2={300} y2={130} stroke="#8a93a6" strokeWidth={6} />

        {/* Sunshade skirt */}
        <ellipse cx={200} cy={185} rx={95} ry={38} fill="#d8a13a" stroke="#8a5f14" strokeWidth={5} />
        <ellipse cx={200} cy={175} rx={95} ry={38} fill="#f2c14e" stroke="#8a5f14" strokeWidth={5} />

        {/* Barrel */}
        <rect x={140} y={45} width={120} height={135} rx={18} fill="#e8ecf4" stroke="#7a8499" strokeWidth={6} />
        <rect x={140} y={45} width={120} height={26} rx={13} fill="#aab4c8" stroke="#7a8499" strokeWidth={6} />

        {/* Aperture (eye) */}
        <circle cx={200} cy={58} r={30} fill="#182742" stroke="#7a8499" strokeWidth={6} />
        <circle cx={191} cy={50} r={9} fill="#9fd4ff" opacity={0.5 + twinkle * 0.5} />

        {/* Cute face on the barrel */}
        <circle cx={178} cy={120} r={7} fill="#182742" />
        <circle cx={222} cy={120} r={7} fill="#182742" />
        <path d="M 182 145 Q 200 160 218 145" fill="none" stroke="#182742" strokeWidth={6} strokeLinecap="round" />

        {/* Antenna */}
        <line x1={258} y1={60} x2={288} y2={28} stroke="#8a93a6" strokeWidth={5} strokeLinecap="round" />
        <circle cx={292} cy={24} r={7} fill="#ff5d5d" opacity={0.4 + twinkle * 0.6} />

        {/* Sparkles */}
        <g opacity={twinkle}>
          <path d="M 90 40 l 5 12 l 12 5 l -12 5 l -5 12 l -5 -12 l -12 -5 l 12 -5 z" fill="#fff2ae" />
        </g>
        <g opacity={1 - twinkle}>
          <path d="M 330 70 l 4 9 l 9 4 l -9 4 l -4 9 l -4 -9 l -9 -4 l 9 -4 z" fill="#fff2ae" />
        </g>
      </svg>
    </div>
  );
};
