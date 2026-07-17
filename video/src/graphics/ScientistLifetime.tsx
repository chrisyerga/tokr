import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type BillDrop = {
  at: number; // seconds into overlay
  x: number;
  drift: number;
  spin: number;
};

/** Sparse drops across ~20s — meager funding vibes. */
const BILLS: BillDrop[] = [
  { at: 1.2, x: 140, drift: 18, spin: 1.2 },
  { at: 3.4, x: 220, drift: -22, spin: -0.9 },
  { at: 5.8, x: 170, drift: 12, spin: 1.5 },
  { at: 8.1, x: 250, drift: -16, spin: -1.1 },
  { at: 10.6, x: 155, drift: 24, spin: 0.8 },
  { at: 13.2, x: 210, drift: -10, spin: -1.4 },
  { at: 15.5, x: 185, drift: 14, spin: 1.0 },
  { at: 17.8, x: 235, drift: -20, spin: -0.7 },
];

const STACK_X = 210;
const STACK_Y = 1180;
const FALL_SEC = 1.35;

const DollarBill: React.FC<{
  drop: BillDrop;
  t: number;
  stackIndex: number;
}> = ({ drop, t, stackIndex }) => {
  const local = t - drop.at;
  if (local < 0) return null;

  const fall = interpolate(local, [0, FALL_SEC], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const landed = fall >= 1;
  const flutter = Math.sin(local * Math.PI * 2 * 2.2 + drop.spin) * (1 - fall) * 28;
  const spin = drop.spin * 55 * fall + Math.sin(local * 3) * 8 * (1 - fall);

  const startY = 380;
  const endY = STACK_Y - 8 - stackIndex * 7;
  const x = landed
    ? STACK_X + (stackIndex % 3) * 4 - 4
    : drop.x + drop.drift * fall + flutter;
  const y = landed ? endY : startY + (endY - startY) * fall;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 72,
        height: 34,
        transform: `rotate(${landed ? (stackIndex % 2 === 0 ? -4 : 5) : spin}deg)`,
        transformOrigin: "50% 50%",
        opacity: interpolate(fall, [0, 0.08], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
      }}
    >
      <svg viewBox="0 0 72 34" width="100%" height="100%">
        <rect x={1} y={1} width={70} height={32} rx={3} fill="#3d8f4a" stroke="#1e5a28" strokeWidth={2} />
        <rect x={5} y={5} width={62} height={24} rx={2} fill="none" stroke="#8fd49a" strokeWidth={1.5} />
        <circle cx={36} cy={17} r={8} fill="#2f6e39" stroke="#8fd49a" strokeWidth={1.5} />
        <text
          x={36}
          y={21}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill="#c8f0d0"
          fontFamily="Montserrat, Arial Black, sans-serif"
        >
          $
        </text>
      </svg>
    </div>
  );
};

/**
 * "A lifetime for some scientists": chalk-dusted researcher scribbles
 * equations while his beard grows comically long. Occasional dollar
 * bills flutter down onto a meager stack. Keeps center clear.
 */
export const ScientistLifetime: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Beard grows over the full ~20s beat.
  const beardLen = interpolate(t, [0.4, 19.5], [18, 340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beardWave = Math.sin(t * Math.PI * 2 * 0.35) * 6;

  // Scribble arm / chalk (SVG root coords on the board)
  const scribble = Math.sin(t * Math.PI * 2 * 1.8);
  const chalkX = 118 + scribble * 22;
  const chalkY = 108 + Math.sin(t * Math.PI * 2 * 2.4) * 10;
  // Scientist group is translated (40, 175) — convert chalk into local space for the arm.
  const chalkLocalX = chalkX - 40;
  const chalkLocalY = chalkY - 175;

  // How many bills have finished falling
  const landedCount = BILLS.filter((b) => t >= b.at + FALL_SEC).length;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Scene cluster — left edge */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 520,
          opacity: enter,
          transform: `translateX(${interpolate(enter, [0, 1], [-280, 0])}px)`,
        }}
      >
        <svg
          viewBox="0 0 320 520"
          width={340}
          height={552}
          style={{ overflow: "visible", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))" }}
        >
          {/* Chalkboard */}
          <rect x={16} y={20} width={200} height={160} rx={8} fill="#1a3d2a" stroke="#3d2a1a" strokeWidth={8} />
          <rect x={24} y={28} width={184} height={144} rx={4} fill="#244f36" />
          {/* Chalk tray */}
          <rect x={20} y={172} width={192} height={10} rx={2} fill="#6b4a2e" stroke="#3d2a1a" strokeWidth={3} />
          {/* Equations (faint chalk) */}
          <g fill="none" stroke="#d8e8d0" strokeWidth={2.2} opacity={0.75} strokeLinecap="round">
            <path d="M 40 55 Q 70 40 100 58 T 160 52" />
            <path d="M 45 85 L 70 85 L 85 70 L 110 95 L 140 78" />
            <text x={40} y={130} fill="#d8e8d0" stroke="none" fontSize={16} fontFamily="monospace" opacity={0.85}>
              ∫λ dA ≈ ∞
            </text>
            <text x={40} y={155} fill="#d8e8d0" stroke="none" fontSize={14} fontFamily="monospace" opacity={0.7}>
              grant = 0
            </text>
          </g>
          {/* Fresh chalk dust + stick (board space) */}
          <circle cx={chalkX} cy={chalkY} r={2.5} fill="#f4f0e0" opacity={0.9} />
          <rect
            x={chalkX - 8}
            y={chalkY - 2}
            width={18}
            height={6}
            rx={2}
            fill="#f4f0e0"
            stroke="#c4b89a"
            strokeWidth={1.5}
            transform={`rotate(${scribble * 12} ${chalkX} ${chalkY})`}
          />

          {/* Scientist body */}
          <g transform="translate(40, 175)">
            {/* Lab coat */}
            <path
              d="M 70 90 L 45 250 L 195 250 L 170 90 Q 120 70 70 90 Z"
              fill="#f2f0ea"
              stroke="#8a8680"
              strokeWidth={5}
            />
            <path d="M 95 95 L 120 160 L 145 95" fill="none" stroke="#8a8680" strokeWidth={4} />
            {/* Tie peek */}
            <path d="M 112 100 L 120 145 L 128 100 Z" fill="#c4502e" stroke="#7d2c14" strokeWidth={2} />

            {/* Arms */}
            <path
              d="M 70 110 Q 30 130 25 170"
              fill="none"
              stroke="#f2f0ea"
              strokeWidth={22}
              strokeLinecap="round"
            />
            {/* Writing arm — reaches up to the board */}
            <path
              d={`M 170 110 Q ${200 + scribble * 8} ${40 + scribble * 6} ${chalkLocalX + 8} ${chalkLocalY + 12}`}
              fill="none"
              stroke="#f2f0ea"
              strokeWidth={22}
              strokeLinecap="round"
            />
            {/* Hands */}
            <circle cx={22} cy={175} r={12} fill="#e8c4a0" stroke="#9c7350" strokeWidth={3} />
            <circle
              cx={chalkLocalX + 10}
              cy={chalkLocalY + 14}
              r={11}
              fill="#e8c4a0"
              stroke="#9c7350"
              strokeWidth={3}
            />

            {/* Head */}
            <circle cx={120} cy={55} r={42} fill="#f0c8a0" stroke="#9c7350" strokeWidth={5} />
            {/* Hair (balding crown) */}
            <path
              d="M 85 40 Q 90 18 120 16 Q 150 18 155 40"
              fill="none"
              stroke="#6a5a48"
              strokeWidth={8}
              strokeLinecap="round"
            />
            <ellipse cx={88} cy={48} rx={10} ry={14} fill="#6a5a48" />
            <ellipse cx={152} cy={48} rx={10} ry={14} fill="#6a5a48" />

            {/* Glasses */}
            <circle cx={105} cy={55} r={11} fill="rgba(180,210,230,0.25)" stroke="#2a2a2a" strokeWidth={3.5} />
            <circle cx={135} cy={55} r={11} fill="rgba(180,210,230,0.25)" stroke="#2a2a2a" strokeWidth={3.5} />
            <line x1={116} y1={55} x2={124} y2={55} stroke="#2a2a2a" strokeWidth={3} />
            {/* Eyes */}
            <circle cx={105} cy={55} r={3.5} fill="#2a2a2a" />
            <circle cx={135} cy={55} r={3.5} fill="#2a2a2a" />
            {/* Focused brow */}
            <path d="M 94 44 Q 105 40 116 44" fill="none" stroke="#6a5a48" strokeWidth={3} strokeLinecap="round" />
            <path d="M 124 44 Q 135 40 146 44" fill="none" stroke="#6a5a48" strokeWidth={3} strokeLinecap="round" />

            {/* Growing beard — wavy ribbon from chin */}
            <g transform={`translate(${beardWave}, 0)`}>
              <path
                d={`
                  M 100 85
                  Q 110 ${85 + beardLen * 0.15} 105 ${85 + beardLen * 0.35}
                  Q 98 ${85 + beardLen * 0.55} 108 ${85 + beardLen * 0.72}
                  Q 118 ${85 + beardLen * 0.88} 112 ${85 + beardLen}
                  L 128 ${85 + beardLen}
                  Q 122 ${85 + beardLen * 0.88} 132 ${85 + beardLen * 0.72}
                  Q 142 ${85 + beardLen * 0.55} 135 ${85 + beardLen * 0.35}
                  Q 130 ${85 + beardLen * 0.15} 140 85
                  Q 120 95 100 85
                  Z
                `}
                fill="#c8c2b8"
                stroke="#8a8680"
                strokeWidth={4}
              />
              {/* Beard highlight strands */}
              <path
                d={`
                  M 118 90
                  Q 114 ${85 + beardLen * 0.4} 120 ${85 + beardLen * 0.7}
                  Q 124 ${85 + beardLen * 0.9} 120 ${85 + beardLen - 4}
                `}
                fill="none"
                stroke="#e4e0d8"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.7}
              />
              {/* Mustache */}
              <path
                d="M 100 80 Q 110 88 120 82 Q 130 88 140 80"
                fill="none"
                stroke="#c8c2b8"
                strokeWidth={7}
                strokeLinecap="round"
              />
            </g>

            {/* Mouth hint under mustache early on */}
            {beardLen < 40 ? (
              <path d="M 110 88 Q 120 94 130 88" fill="none" stroke="#9c7350" strokeWidth={3} strokeLinecap="round" />
            ) : null}
          </g>
        </svg>
      </div>

      {/* Meager dollar stack base (table-ish) */}
      <div
        style={{
          position: "absolute",
          left: STACK_X - 30,
          top: STACK_Y + 10,
          width: 130,
          height: 14,
          borderRadius: 4,
          background: "#5b4632",
          opacity: enter * 0.85,
          boxShadow: "0 4px 0 #3a2c1c",
        }}
      />
      {/* Tiny label */}
      <div
        style={{
          position: "absolute",
          left: STACK_X - 20,
          top: STACK_Y + 32,
          opacity: enter,
          fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
          fontWeight: 800,
          fontSize: 22,
          color: "#8fd49a",
          textShadow: "3px 0 #000, -3px 0 #000, 0 3px #000, 0 -3px #000",
          transform: `scale(${interpolate(landedCount, [0, 8], [0.9, 1.05], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
        }}
      >
        ${landedCount * 1}
      </div>

      {/* Falling / stacked bills */}
      {BILLS.map((bill, i) => (
        <DollarBill key={i} drop={bill} t={t} stackIndex={i} />
      ))}
    </AbsoluteFill>
  );
};
