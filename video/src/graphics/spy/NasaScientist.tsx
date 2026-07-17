import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type ScientistVariant = {
  /** Skin fill */
  skin: string;
  skinStroke: string;
  /** Hair fill */
  hair: string;
  /** short | bun | ponytail | afro | balding */
  hairStyle: "short" | "bun" | "ponytail" | "afro" | "balding";
  /** Optional skirt hem for feminine silhouette */
  skirt?: boolean;
};

export const SCIENTIST_CAST: ScientistVariant[] = [
  { skin: "#f0c8a0", skinStroke: "#9c7350", hair: "#2a1f18", hairStyle: "short" },
  { skin: "#c68642", skinStroke: "#7a4a28", hair: "#1a1210", hairStyle: "bun", skirt: true },
  { skin: "#8d5524", skinStroke: "#5a3518", hair: "#0d0a08", hairStyle: "afro" },
  { skin: "#f5d0b0", skinStroke: "#b08060", hair: "#6b3a2a", hairStyle: "ponytail", skirt: true },
  { skin: "#d4a574", skinStroke: "#8a5f3a", hair: "#3a2a20", hairStyle: "balding" },
];

/**
 * Lab-coat NASA scientist with gender/ethnicity variants via hair + skin.
 */
export const NasaScientist: React.FC<{
  size?: number;
  variant?: ScientistVariant;
  celebrate?: boolean;
  /** Carry a tiny telescope under one arm */
  carrying?: boolean;
}> = ({
  size = 200,
  variant = SCIENTIST_CAST[0]!,
  celebrate = false,
  carrying = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = celebrate ? Math.sin(t * Math.PI * 2 * 2.2) * 8 : Math.sin(t * Math.PI * 2 * 0.4) * 3;
  const armUp = celebrate ? -40 + Math.sin(t * Math.PI * 2 * 2.2) * 15 : 10;

  return (
    <div
      style={{
        width: size,
        height: size * 1.35,
        transform: `translateY(${bob}px)`,
        filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))",
      }}
    >
      <svg viewBox="0 0 160 220" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Legs */}
        <path d="M 60 160 L 52 205" stroke="#2a3a5c" strokeWidth={14} strokeLinecap="round" />
        <path d="M 100 160 L 108 205" stroke="#2a3a5c" strokeWidth={14} strokeLinecap="round" />
        <ellipse cx={50} cy={208} rx={14} ry={6} fill="#1a1a2e" />
        <ellipse cx={110} cy={208} rx={14} ry={6} fill="#1a1a2e" />

        {/* Skirt optional */}
        {variant.skirt ? (
          <path d="M 48 145 L 40 175 L 120 175 L 112 145 Z" fill="#3a4a6e" stroke="#1e2a44" strokeWidth={3} />
        ) : null}

        {/* Lab coat body */}
        <path
          d="M 45 85 L 35 160 L 125 160 L 115 85 Q 80 70 45 85 Z"
          fill="#f2f0ea"
          stroke="#8a8680"
          strokeWidth={4}
        />
        <path d="M 70 88 L 80 130 L 90 88" fill="none" stroke="#8a8680" strokeWidth={3} />
        {/* Badge */}
        <rect x={92} y={105} width={16} height={12} rx={2} fill="#1e3a8a" stroke="#0e1a44" strokeWidth={1.5} />

        {/* Arms */}
        <path
          d={`M 45 100 Q 20 ${110 + armUp * 0.3} 18 ${140 + armUp * 0.15}`}
          fill="none"
          stroke="#f2f0ea"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d={`M 115 100 Q ${140 + (celebrate ? 10 : 0)} ${95 + armUp} ${145} ${celebrate ? 50 : 130}`}
          fill="none"
          stroke="#f2f0ea"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <circle cx={16} cy={142 + armUp * 0.1} r={9} fill={variant.skin} stroke={variant.skinStroke} strokeWidth={3} />
        <circle
          cx={145}
          cy={celebrate ? 48 : 132}
          r={9}
          fill={variant.skin}
          stroke={variant.skinStroke}
          strokeWidth={3}
        />

        {/* Carried mini telescope */}
        {carrying ? (
          <g transform="translate(8, 150) rotate(-20)">
            <rect x={0} y={0} width={36} height={14} rx={4} fill="#e8ecf4" stroke="#7a8499" strokeWidth={2} />
            <ellipse cx={18} cy={16} rx={14} ry={5} fill="#f2c14e" stroke="#8a5f14" strokeWidth={2} />
          </g>
        ) : null}

        {/* Neck + head */}
        <rect x={70} y={68} width={20} height={18} rx={4} fill={variant.skin} />
        <circle cx={80} cy={48} r={32} fill={variant.skin} stroke={variant.skinStroke} strokeWidth={4} />

        {/* Hair */}
        <Hair style={variant.hairStyle} color={variant.hair} />

        {/* Face */}
        <circle cx={70} cy={48} r={3.5} fill="#2a2a2a" />
        <circle cx={90} cy={48} r={3.5} fill="#2a2a2a" />
        <path d="M 70 62 Q 80 68 90 62" fill="none" stroke={variant.skinStroke} strokeWidth={3} strokeLinecap="round" />
        {/* Glasses */}
        <circle cx={70} cy={48} r={9} fill="none" stroke="#2a2a2a" strokeWidth={2.5} />
        <circle cx={90} cy={48} r={9} fill="none" stroke="#2a2a2a" strokeWidth={2.5} />
        <line x1={79} y1={48} x2={81} y2={48} stroke="#2a2a2a" strokeWidth={2} />
      </svg>
    </div>
  );
};

const Hair: React.FC<{ style: ScientistVariant["hairStyle"]; color: string }> = ({
  style,
  color,
}) => {
  switch (style) {
    case "bun":
      return (
        <>
          <ellipse cx={80} cy={28} rx={34} ry={22} fill={color} />
          <circle cx={80} cy={10} r={14} fill={color} stroke="#1a1210" strokeWidth={2} />
        </>
      );
    case "ponytail":
      return (
        <>
          <ellipse cx={80} cy={30} rx={32} ry={20} fill={color} />
          <ellipse cx={118} cy={55} rx={12} ry={28} fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          <circle cx={80} cy={40} r={40} fill={color} />
          <circle cx={55} cy={35} r={16} fill={color} />
          <circle cx={105} cy={35} r={16} fill={color} />
          <circle cx={80} cy={18} r={14} fill={color} />
        </>
      );
    case "balding":
      return (
        <>
          <path d="M 52 42 Q 55 18 80 16 Q 105 18 108 42" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
          <ellipse cx={54} cy={48} rx={8} ry={12} fill={color} />
          <ellipse cx={106} cy={48} rx={8} ry={12} fill={color} />
        </>
      );
    default:
      return <ellipse cx={80} cy={30} rx={34} ry={22} fill={color} />;
  }
};
