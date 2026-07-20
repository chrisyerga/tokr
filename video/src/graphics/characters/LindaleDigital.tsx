import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Lindale Digital: caricature of the host/editor. Voluminous swept-back
 * silver-blond hair, tan, AirPods, heather blue-gray tee — plus twinkling
 * AI sparkles for the "AI editing & animation" credit.
 */
export const LindaleDigital: React.FC<{ size?: number }> = ({ size = 280 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bob = Math.sin(t * Math.PI * 2 * 0.45) * 6;
  const lean = Math.sin(t * Math.PI * 2 * 0.35) * 2.5;

  const sparkle = (phase: number) =>
    0.4 + 0.6 * ((Math.sin(t * Math.PI * 2 * 1.3 + phase) + 1) / 2);
  const sparkleScale = (phase: number) =>
    0.8 + 0.25 * ((Math.sin(t * Math.PI * 2 * 1.1 + phase) + 1) / 2);

  const SPARKLE_PATH =
    "M 0 -9 L 2.5 -2.5 L 9 0 L 2.5 2.5 L 0 9 L -2.5 2.5 L -9 0 L -2.5 -2.5 Z";

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
      <svg viewBox="0 0 240 300" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* Shoulders / heather tee */}
        <path
          d="M 40 250 Q 50 200 70 175 Q 120 155 170 175 Q 190 200 200 250 L 200 290 L 40 290 Z"
          fill="#8fa3b8"
          stroke="#5a6e82"
          strokeWidth={5}
        />
        {/* Crew neck */}
        <path
          d="M 95 180 Q 120 196 145 180"
          fill="none"
          stroke="#5a6e82"
          strokeWidth={4}
        />
        {/* Heather texture flecks */}
        <g stroke="#a8bac9" strokeWidth={2} strokeLinecap="round" opacity={0.7}>
          <path d="M 70 220 L 78 216" />
          <path d="M 150 232 L 158 228" />
          <path d="M 112 250 L 120 246" />
        </g>

        {/* Neck */}
        <rect x={105} y={155} width={30} height={28} rx={6} fill="#e0b48c" />

        {/* Head */}
        <ellipse
          cx={120}
          cy={112}
          rx={50}
          ry={54}
          fill="#e8b888"
          stroke="#a07850"
          strokeWidth={5}
        />
        {/* Silver-blond hair — side part on viewer-right, big swoop cresting
            left. One connected mass drawn over the head so it hugs the scalp. */}
        <path
          d="M 154 76
             Q 128 82 104 82
             Q 88 82 78 90
             Q 72 96 68 106
             Q 56 100 52 88
             Q 42 64 58 42
             Q 74 24 98 24
             Q 116 22 126 28
             Q 148 26 160 42
             Q 168 54 168 70
             Q 166 80 162 86
             Q 158 80 154 76 Z"
          fill="#e8dfc8"
          stroke="#b8a888"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* Part line */}
        <path d="M 154 76 Q 158 66 160 56" fill="none" stroke="#b8a888" strokeWidth={3} strokeLinecap="round" />
        {/* Wave fold at the crest */}
        <path d="M 100 26 Q 112 32 114 46" fill="none" stroke="#b8a888" strokeWidth={3} strokeLinecap="round" />
        {/* Sweep strands flowing from the part toward the left crest */}
        <g fill="none" stroke="#cfc3a6" strokeWidth={3} strokeLinecap="round">
          <path d="M 150 68 Q 118 56 88 62" />
          <path d="M 152 56 Q 120 38 84 46" />
          <path d="M 154 44 Q 128 28 100 28" />
        </g>
        {/* Crest highlight */}
        <ellipse cx={90} cy={34} rx={18} ry={6} fill="#f2ecd9" opacity={0.8} transform="rotate(-14 90 34)" />

        {/* Mid-50s cues: faint forehead lines */}
        <g fill="none" stroke="#c89868" strokeWidth={2} opacity={0.5} strokeLinecap="round">
          <path d="M 98 82 Q 120 78 142 82" />
          <path d="M 102 90 Q 120 87 138 90" />
        </g>

        {/* Brows */}
        <path d="M 78 96 Q 90 90 102 95" fill="none" stroke="#a89060" strokeWidth={6} strokeLinecap="round" />
        <path d="M 138 95 Q 150 90 162 96" fill="none" stroke="#a89060" strokeWidth={6} strokeLinecap="round" />

        {/* Eyes with glints */}
        <ellipse cx={92} cy={106} rx={5} ry={6} fill="#2a2a2a" />
        <ellipse cx={148} cy={106} rx={5} ry={6} fill="#2a2a2a" />
        <circle cx={94} cy={104} r={1.8} fill="#fff" />
        <circle cx={150} cy={104} r={1.8} fill="#fff" />
        {/* Crow's-feet */}
        <g fill="none" stroke="#c89868" strokeWidth={2} opacity={0.55} strokeLinecap="round">
          <path d="M 78 102 L 72 100" />
          <path d="M 78 108 L 72 110" />
          <path d="M 162 102 L 168 100" />
          <path d="M 162 108 L 168 110" />
        </g>

        {/* Light gray-blond stubble around the jaw */}
        <path
          d="M 88 132 Q 96 158 120 162 Q 144 158 152 132 Q 150 154 136 161 Q 120 166 104 161 Q 90 154 88 132 Z"
          fill="#b09a80"
          opacity={0.4}
        />

        {/* Slight open smile */}
        <path
          d="M 100 136 Q 120 147 140 133 Q 129 141 118 141 Q 106 140 100 136 Z"
          fill="#fff"
          stroke="#a07850"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* Smile brackets */}
        <g fill="none" stroke="#c89868" strokeWidth={2.5} opacity={0.5} strokeLinecap="round">
          <path d="M 92 128 Q 90 136 94 142" />
          <path d="M 148 128 Q 150 136 146 142" />
        </g>

        {/* AirPods — small, in-ear */}
        <g>
          <circle cx={68} cy={118} r={4.5} fill="#ffffff" stroke="#c8ced4" strokeWidth={1.5} />
          <rect x={65} y={119} width={5.5} height={12} rx={2.75} fill="#ffffff" stroke="#c8ced4" strokeWidth={1.5} transform="rotate(10 68 121)" />
          <circle cx={172} cy={118} r={4.5} fill="#ffffff" stroke="#c8ced4" strokeWidth={1.5} />
          <rect x={169.5} y={119} width={5.5} height={12} rx={2.75} fill="#ffffff" stroke="#c8ced4" strokeWidth={1.5} transform="rotate(-10 172 121)" />
        </g>

        {/* AI sparkles twinkling around the mane */}
        <g transform={`translate(196, 42) scale(${sparkleScale(0)})`} opacity={sparkle(0)}>
          <path d={SPARKLE_PATH} fill="#7fd4ff" />
        </g>
        <g transform={`translate(214, 78) scale(${sparkleScale(2.1) * 0.7})`} opacity={sparkle(2.1)}>
          <path d={SPARKLE_PATH} fill="#ffd400" />
        </g>
        <g transform={`translate(38, 52) scale(${sparkleScale(4.2) * 0.8})`} opacity={sparkle(4.2)}>
          <path d={SPARKLE_PATH} fill="#7fd4ff" />
        </g>
      </svg>
    </div>
  );
};
