import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Cartoony Nancy Grace Roman: silver mid-century hair, cat-eye glasses,
 * high collar blouse, floral earrings — and an optional smug speech bubble.
 */
export const NancyGraceRoman: React.FC<{
  size?: number;
  /** Show the "I found it!" (or custom) speech bubble. */
  speech?: string | null;
  /** Seconds after mount before the bubble pops in. */
  speechAt?: number;
}> = ({ size = 280, speech = null, speechAt = 0.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = Math.sin(t * Math.PI * 2 * 0.45) * 6;
  const lean = Math.sin(t * Math.PI * 2 * 0.35) * 2.5;
  const glint = (Math.sin(t * Math.PI * 2 * 1.1) + 1) / 2;
  // Smug brow raise + slight chin lift
  const smug = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 0.55);

  const bubbleSpring = spring({
    frame: Math.max(0, frame - Math.round(speechAt * fps)),
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  const bubbleScale = speech
    ? interpolate(bubbleSpring, [0, 1], [0.4, 1])
    : 0;
  const bubbleOpacity = speech ? bubbleSpring : 0;

  return (
    <div
      style={{
        width: size,
        height: size * 1.25,
        position: "relative",
        transform: `translateY(${bob}px) rotate(${lean}deg)`,
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.5))",
      }}
    >
      {speech ? (
        <div
          style={{
            position: "absolute",
            left: "52%",
            top: -8,
            transform: `translateX(-50%) scale(${bubbleScale})`,
            opacity: bubbleOpacity,
            transformOrigin: "50% 100%",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              background: "#fff8e8",
              color: "#1a1a1a",
              fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
              fontWeight: 800,
              fontSize: size * 0.11,
              lineHeight: 1.15,
              padding: `${size * 0.045}px ${size * 0.08}px`,
              borderRadius: size * 0.08,
              border: `${Math.max(3, size * 0.018)}px solid #1a1a1a`,
              whiteSpace: "nowrap",
              boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
            }}
          >
            {speech}
            {/* Tail pointing down toward her face */}
            <div
              style={{
                position: "absolute",
                left: "42%",
                bottom: -size * 0.055,
                width: 0,
                height: 0,
                borderLeft: `${size * 0.04}px solid transparent`,
                borderRight: `${size * 0.04}px solid transparent`,
                borderTop: `${size * 0.055}px solid #1a1a1a`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "42%",
                bottom: -size * 0.035,
                width: 0,
                height: 0,
                borderLeft: `${size * 0.032}px solid transparent`,
                borderRight: `${size * 0.032}px solid transparent`,
                borderTop: `${size * 0.045}px solid #fff8e8`,
                marginLeft: size * 0.008,
              }}
            />
          </div>
        </div>
      ) : null}

      <svg viewBox="0 0 240 300" width="100%" height="100%">
        {/* Shoulders / blouse */}
        <path
          d="M 40 250 Q 50 200 70 175 Q 120 155 170 175 Q 190 200 200 250 L 200 290 L 40 290 Z"
          fill="#f4f0e6"
          stroke="#9a9078"
          strokeWidth={5}
        />
        {/* High standing collar */}
        <path
          d="M 88 178 Q 95 155 120 152 Q 145 155 152 178 L 145 195 Q 120 185 95 195 Z"
          fill="#faf7f0"
          stroke="#9a9078"
          strokeWidth={4}
        />
        {/* Embroidery flourish below collar */}
        <g fill="none" stroke="#c4b89a" strokeWidth={2.5} strokeLinecap="round">
          <path d="M 105 198 Q 120 208 135 198" />
          <path d="M 112 205 Q 120 214 128 205" />
          <circle cx={120} cy={202} r={3} fill="#d4c8a8" stroke="none" />
        </g>

        {/* Neck */}
        <rect x={105} y={155} width={30} height={28} rx={6} fill="#e8c4a0" />

        {/* Silver hair — crown + side curls only (kept clear of the lower face) */}
        <path
          d="M 58 118
             Q 48 88 62 62
             Q 78 38 120 36
             Q 162 38 178 62
             Q 192 88 182 118
             Q 176 100 168 92
             Q 150 78 120 76
             Q 90 78 72 92
             Q 64 100 58 118 Z"
          fill="#d8d4cc"
          stroke="#8a8680"
          strokeWidth={4}
        />
        {/* Soft curl puffs at the sides — stop above cheek level */}
        <ellipse cx={56} cy={88} rx={16} ry={22} fill="#e4e0d8" stroke="#8a8680" strokeWidth={3} />
        <ellipse cx={184} cy={88} rx={16} ry={22} fill="#e4e0d8" stroke="#8a8680" strokeWidth={3} />
        <ellipse cx={78} cy={58} rx={18} ry={16} fill="#e4e0d8" stroke="#8a8680" strokeWidth={3} />
        <ellipse cx={162} cy={58} rx={18} ry={16} fill="#e4e0d8" stroke="#8a8680" strokeWidth={3} />
        <ellipse cx={120} cy={48} rx={34} ry={18} fill="#ece8e0" stroke="#8a8680" strokeWidth={3} />

        {/* Head (drawn over hair so no gray band across the face) */}
        <ellipse
          cx={120}
          cy={112}
          rx={50}
          ry={54}
          fill="#f0c8a0"
          stroke="#9c7350"
          strokeWidth={5}
        />
        {/* Hairline fringe over forehead */}
        <path
          d="M 78 92 Q 95 78 120 76 Q 145 78 162 92 Q 148 88 120 86 Q 92 88 78 92 Z"
          fill="#d8d4cc"
        />

        {/* Floral cluster earrings */}
        <g transform="translate(58, 125)">
          <circle cx={0} cy={0} r={7} fill="#e8d48a" stroke="#a89040" strokeWidth={2} />
          <circle cx={-6} cy={-5} r={5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
          <circle cx={6} cy={-5} r={5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
          <circle cx={-5} cy={6} r={4.5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
          <circle cx={5} cy={6} r={4.5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
        </g>
        <g transform="translate(182, 125)">
          <circle cx={0} cy={0} r={7} fill="#e8d48a" stroke="#a89040" strokeWidth={2} />
          <circle cx={-6} cy={-5} r={5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
          <circle cx={6} cy={-5} r={5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
          <circle cx={-5} cy={6} r={4.5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
          <circle cx={5} cy={6} r={4.5} fill="#f0e0a0" stroke="#a89040" strokeWidth={1.5} />
        </g>

        {/* Exaggerated cat-eye glasses — sharp upswept outer corners */}
        <g transform={`translate(0, ${-smug * 1.5})`}>
          {/* Left frame: lens + winged tip as one silhouette */}
          <path
            d="M 112 92
               L 92 90
               L 58 72
               L 68 96
               C 66 104, 68 112, 76 116
               C 86 122, 102 122, 110 114
               C 116 108, 116 96, 112 92 Z"
            fill="rgba(180,210,230,0.4)"
            stroke="#1a1a1a"
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Right frame */}
          <path
            d="M 128 92
               L 148 90
               L 182 72
               L 172 96
               C 174 104, 172 112, 164 116
               C 154 122, 138 122, 130 114
               C 124 108, 124 96, 128 92 Z"
            fill="rgba(180,210,230,0.4)"
            stroke="#1a1a1a"
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Thick upper browline emphasizing the wing */}
          <path
            d="M 58 72 L 92 88 L 112 90"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 128 90 L 148 88 L 182 72"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bridge */}
          <path d="M 112 98 Q 120 94 128 98" fill="none" stroke="#1a1a1a" strokeWidth={4} />
          {/* Temple accents */}
          <circle cx={106} cy={90} r={2.5} fill="#c9a24a" />
          <circle cx={134} cy={90} r={2.5} fill="#c9a24a" />
          {/* Lens glint */}
          <line
            x1={78 + glint * 16}
            y1={112}
            x2={86 + glint * 16}
            y2={96}
            stroke="#9fd4ff"
            strokeWidth={3}
            opacity={0.75}
            strokeLinecap="round"
          />
        </g>

        {/* Eyes behind glasses */}
        <ellipse cx={90} cy={104} rx={5} ry={6} fill="#2a2a2a" />
        <ellipse cx={150} cy={104} rx={5} ry={6} fill="#2a2a2a" />
        <circle cx={92} cy={102} r={1.8} fill="#fff" />
        <circle cx={152} cy={102} r={1.8} fill="#fff" />

        {/* Smug closed-mouth smile */}
        <path
          d={`M 100 ${136 - smug} Q 120 ${146 + smug * 2} 140 ${136 - smug}`}
          fill="none"
          stroke="#9c7350"
          strokeWidth={4.5}
          strokeLinecap="round"
        />

        {/* Soft cheek blush */}
        <ellipse cx={74} cy={126} rx={10} ry={6} fill="#e8a090" opacity={0.35} />
        <ellipse cx={166} cy={126} rx={10} ry={6} fill="#e8a090" opacity={0.35} />
      </svg>
    </div>
  );
};
