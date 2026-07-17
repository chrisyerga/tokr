import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Cartoony spy: trench coat, fedora, dark glasses, shifty eyes and a
 * magnifying glass he sneaks up and down.
 */
export const SpyCharacter: React.FC<{ size?: number }> = ({ size = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Shifty look: slide side to side, glasses glint, magnifier bobs
  const shift = Math.sin(t * Math.PI * 2 * 0.4) * 14;
  const lean = Math.sin(t * Math.PI * 2 * 0.4 + 0.6) * 3;
  const glint = (Math.sin(t * Math.PI * 2 * 0.9) + 1) / 2;
  const magnify = Math.sin(t * Math.PI * 2 * 0.55) * 12;

  return (
    <div
      style={{
        width: size,
        height: size * 1.15,
        transform: `translateX(${shift}px) rotate(${lean}deg)`,
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox="0 0 260 300" width="100%" height="100%">
        {/* Trench coat */}
        <path
          d="M 70 140 L 55 275 L 205 275 L 190 140 Q 130 120 70 140 Z"
          fill="#8a6d4a"
          stroke="#4f3b22"
          strokeWidth={6}
        />
        {/* Coat lapels */}
        <path d="M 110 140 L 130 190 L 150 140 Z" fill="#6e5638" stroke="#4f3b22" strokeWidth={4} />
        {/* Belt */}
        <rect x={62} y={200} width={136} height={16} fill="#4f3b22" />
        <rect x={118} y={198} width={24} height={20} rx={4} fill="#d8a13a" stroke="#4f3b22" strokeWidth={3} />

        {/* Head */}
        <circle cx={130} cy={95} r={48} fill="#f0c8a0" stroke="#9c7350" strokeWidth={5} />

        {/* Fedora */}
        <ellipse cx={130} cy={62} rx={64} ry={14} fill="#3a3f4d" stroke="#20242e" strokeWidth={4} />
        <path d="M 92 62 Q 92 22 130 22 Q 168 22 168 62 Z" fill="#3a3f4d" stroke="#20242e" strokeWidth={4} />
        <rect x={92} y={48} width={76} height={10} fill="#20242e" />

        {/* Dark glasses with glint */}
        <rect x={96} y={86} width={30} height={18} rx={6} fill="#141821" />
        <rect x={134} y={86} width={30} height={18} rx={6} fill="#141821" />
        <line x1={126} y1={94} x2={134} y2={94} stroke="#141821" strokeWidth={5} />
        <line
          x1={100 + glint * 18}
          y1={102}
          x2={108 + glint * 18}
          y2={88}
          stroke="#9fd4ff"
          strokeWidth={3}
          opacity={0.8}
        />

        {/* Sneaky smile */}
        <path d="M 112 122 Q 130 130 148 124" fill="none" stroke="#9c7350" strokeWidth={5} strokeLinecap="round" />

        {/* Popped collar hiding chin */}
        <path d="M 82 135 L 100 112 L 130 140 L 160 112 L 178 135 Z" fill="#6e5638" stroke="#4f3b22" strokeWidth={4} />

        {/* Left arm holding magnifying glass */}
        <g transform={`translate(0, ${magnify})`}>
          <path d="M 70 160 Q 30 175 32 215" fill="none" stroke="#8a6d4a" strokeWidth={20} strokeLinecap="round" />
          <circle cx={30} cy={228} r={11} fill="#f0c8a0" stroke="#9c7350" strokeWidth={4} />
          {/* Magnifier */}
          <circle cx={18} cy={252} r={20} fill="rgba(159,212,255,0.35)" stroke="#4f3b22" strokeWidth={6} />
          <line x1={30} y1={238} x2={38} y2={228} stroke="#4f3b22" strokeWidth={8} strokeLinecap="round" />
        </g>

        {/* Right arm tucked */}
        <path d="M 190 160 Q 220 180 212 215" fill="none" stroke="#8a6d4a" strokeWidth={20} strokeLinecap="round" />
      </svg>
    </div>
  );
};
