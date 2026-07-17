import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type SpyPose = "idle" | "catch" | "shrug" | "toss";

/**
 * Bottom-screen spy with pose variants for the NRO story.
 * Same trench-coat look as SpyCharacter, with catch/shrug/toss arms.
 */
export const SpyActor: React.FC<{
  size?: number;
  pose?: SpyPose;
  /** Disable idle sway (e.g. while walking via parent transform) */
  still?: boolean;
}> = ({ size = 260, pose = "idle", still = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const shift = still ? 0 : Math.sin(t * Math.PI * 2 * 0.4) * 10;
  const lean = still ? 0 : Math.sin(t * Math.PI * 2 * 0.4 + 0.6) * 2.5;
  const glint = (Math.sin(t * Math.PI * 2 * 0.9) + 1) / 2;

  const leftArm =
    pose === "catch" || pose === "toss"
      ? "M 70 160 Q 40 100 50 60"
      : pose === "shrug"
        ? "M 70 160 Q 40 140 35 110"
        : "M 70 160 Q 30 175 32 215";
  const rightArm =
    pose === "catch" || pose === "toss"
      ? "M 190 160 Q 220 100 210 60"
      : pose === "shrug"
        ? "M 190 160 Q 220 140 225 110"
        : "M 190 160 Q 220 180 212 215";

  return (
    <div
      style={{
        width: size,
        height: size * 1.15,
        transform: `translateX(${shift}px) rotate(${lean + (pose === "shrug" ? -4 : 0)}deg)`,
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox="0 0 260 300" width="100%" height="100%" style={{ overflow: "visible" }}>
        <path
          d="M 70 140 L 55 275 L 205 275 L 190 140 Q 130 120 70 140 Z"
          fill="#8a6d4a"
          stroke="#4f3b22"
          strokeWidth={6}
        />
        <path d="M 110 140 L 130 190 L 150 140 Z" fill="#6e5638" stroke="#4f3b22" strokeWidth={4} />
        <rect x={62} y={200} width={136} height={16} fill="#4f3b22" />
        <rect x={118} y={198} width={24} height={20} rx={4} fill="#d8a13a" stroke="#4f3b22" strokeWidth={3} />

        <circle cx={130} cy={95} r={48} fill="#f0c8a0" stroke="#9c7350" strokeWidth={5} />

        <ellipse cx={130} cy={62} rx={64} ry={14} fill="#3a3f4d" stroke="#20242e" strokeWidth={4} />
        <path d="M 92 62 Q 92 22 130 22 Q 168 22 168 62 Z" fill="#3a3f4d" stroke="#20242e" strokeWidth={4} />
        <rect x={92} y={48} width={76} height={10} fill="#20242e" />

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

        {pose === "shrug" ? (
          <path d="M 115 122 Q 130 118 145 122" fill="none" stroke="#9c7350" strokeWidth={5} strokeLinecap="round" />
        ) : (
          <path d="M 112 122 Q 130 130 148 124" fill="none" stroke="#9c7350" strokeWidth={5} strokeLinecap="round" />
        )}

        <path d="M 82 135 L 100 112 L 130 140 L 160 112 L 178 135 Z" fill="#6e5638" stroke="#4f3b22" strokeWidth={4} />

        <path d={leftArm} fill="none" stroke="#8a6d4a" strokeWidth={20} strokeLinecap="round" />
        <path d={rightArm} fill="none" stroke="#8a6d4a" strokeWidth={20} strokeLinecap="round" />

        {(pose === "catch" || pose === "toss") && (
          <>
            <circle cx={50} cy={55} r={12} fill="#f0c8a0" stroke="#9c7350" strokeWidth={4} />
            <circle cx={210} cy={55} r={12} fill="#f0c8a0" stroke="#9c7350" strokeWidth={4} />
          </>
        )}
        {pose === "shrug" && (
          <>
            <circle cx={32} cy={105} r={11} fill="#f0c8a0" stroke="#9c7350" strokeWidth={4} />
            <circle cx={228} cy={105} r={11} fill="#f0c8a0" stroke="#9c7350" strokeWidth={4} />
          </>
        )}
        {pose === "idle" && (
          <>
            <circle cx={30} cy={228} r={11} fill="#f0c8a0" stroke="#9c7350" strokeWidth={4} />
            <circle cx={18} cy={252} r={20} fill="rgba(159,212,255,0.35)" stroke="#4f3b22" strokeWidth={6} />
            <line x1={30} y1={238} x2={38} y2={228} stroke="#4f3b22" strokeWidth={8} strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
};
