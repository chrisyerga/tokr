import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

const YARN_PINK = "#f090a8";
const YARN_PINK_LIGHT = "#ffc8d8";
const YARN_PINK_DARK = "#c86080";
const NEEDLE_SILVER = "#d8dce4";
const NEEDLE_TIP = "#f4a8b8";

/** Pink ball of yarn with a loose trailing strand. */
export const PinkYarnBall: React.FC<{
  size?: number;
  /** Playful wobble when the cat bats it (radians-ish offset). */
  wobble?: number;
  rollX?: number;
}> = ({ size = 100, wobble = 0, rollX = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const strandWave = Math.sin(t * Math.PI * 2 * 2.2) * 6;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `translateX(${rollX}px) rotate(${wobble}deg)`,
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Loose strand trailing left */}
        <path
          d={`M 18 58 Q ${-8 + strandWave} 72, ${-22 + strandWave * 0.5} 88 Q ${-30 + strandWave} 96, -38 102`}
          fill="none"
          stroke={YARN_PINK_LIGHT}
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* Ball */}
        <circle cx={52} cy={50} r={36} fill={YARN_PINK} stroke={YARN_PINK_DARK} strokeWidth={4} />
        {/* Wrap bands */}
        <g fill="none" stroke={YARN_PINK_DARK} strokeWidth={3} opacity={0.55}>
          <ellipse cx={52} cy={50} rx={36} ry={14} transform="rotate(-22 52 50)" />
          <ellipse cx={52} cy={50} rx={36} ry={14} transform="rotate(28 52 50)" />
          <ellipse cx={52} cy={50} rx={36} ry={14} transform="rotate(78 52 50)" />
        </g>
        <path
          d="M 52 14 Q 68 28 62 44"
          fill="none"
          stroke={YARN_PINK_LIGHT}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Highlight */}
        <ellipse cx={40} cy={38} rx={12} ry={8} fill="#fff" opacity={0.22} />
      </svg>
    </div>
  );
};

/** Pair of knitting needles clicking together — no hands. */
export const KnittingNeedles: React.FC<{ size?: number }> = ({ size = 160 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Alternating click motion
  const click = Math.sin(t * Math.PI * 2 * 3.2);
  const needleA = -22 + click * 16;
  const needleB = 22 - click * 16;
  const bob = Math.sin(t * Math.PI * 2 * 3.2 + Math.PI / 2) * 4;

  const Needle: React.FC<{ angle: number }> = ({ angle }) => (
    <g transform={`rotate(${angle} 80 80)`}>
      {/* Shaft */}
      <line
        x1={80}
        y1={80}
        x2={80}
        y2={18}
        stroke={NEEDLE_SILVER}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Taper */}
      <line
        x1={80}
        y1={18}
        x2={80}
        y2={8}
        stroke={NEEDLE_SILVER}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Pink yarn on needle tip */}
      <circle cx={80} cy={12} r={5} fill={NEEDLE_TIP} stroke={YARN_PINK_DARK} strokeWidth={2} />
      {/* Knob end */}
      <circle cx={80} cy={84} r={7} fill="#c9a24a" stroke="#8a7030" strokeWidth={2.5} />
    </g>
  );

  return (
    <div
      style={{
        width: size,
        height: size * 0.75,
        transform: `translateY(${bob}px)`,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
      }}
    >
      <svg viewBox="0 0 160 120" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Tiny stitch of yarn between needles */}
        <ellipse
          cx={80}
          cy={52}
          rx={14 + click * 2}
          ry={8}
          fill={YARN_PINK_LIGHT}
          stroke={YARN_PINK_DARK}
          strokeWidth={2}
          opacity={0.9}
        />
        <Needle angle={needleA} />
        <Needle angle={needleB} />
      </svg>
    </div>
  );
};
