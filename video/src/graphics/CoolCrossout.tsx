import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * "hmm... maybe cool isn't the right word" gag:
 * "COOL!" slams in above the speaker's head, gets scribbled out in red,
 * and "Terrifying?" is written underneath letter by letter.
 */

// Seconds into the overlay (start 150.7 abs):
// COOL! pops on the "hmm", scribble lands on "isn't" (~152.06 abs),
// "Terrifying?" writes after "word" (~152.62 abs).
const T_COOL = 0.15;
const T_STRIKE = 1.35;
const T_WRITE = 1.95;
const FADE_AT = 3.3;

const WORD = "Terrifying?";

export const CoolCrossout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  const coolIn = spring({
    frame: Math.max(0, frame - Math.round(T_COOL * fps)),
    fps,
    config: { damping: 11, stiffness: 160 },
  });

  // Red scribble draws left → right in two quick passes
  const strike = interpolate(t, [T_STRIKE, T_STRIKE + 0.45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    t,
    [Math.min(FADE_AT, durationInFrames / fps - 0.4), durationInFrames / fps - 0.05],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Slight wobble on the whole card so it feels hand-held
  const wobble = Math.sin(t * Math.PI * 2 * 0.5) * 1.5;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 260,
          transform: `translateX(-50%) rotate(${-3 + wobble}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
        }}
      >
        {/* COOL! with animated scribble */}
        <div
          style={{
            position: "relative",
            transform: `scale(${interpolate(coolIn, [0, 1], [0.2, 1])})`,
            opacity: coolIn,
          }}
        >
          <div
            style={{
              fontSize: 150,
              fontWeight: 900,
              letterSpacing: "0.02em",
              color: "#FFD400",
              WebkitTextStroke: "8px #1a1a1a",
              paintOrder: "stroke fill",
              textShadow: "0 10px 0 rgba(0,0,0,0.35)",
            }}
          >
            COOL!
          </div>
          {/* Scribble strike-through */}
          <svg
            viewBox="0 0 500 190"
            style={{
              position: "absolute",
              inset: "-10px -20px",
              width: "calc(100% + 40px)",
              height: "calc(100% + 20px)",
              overflow: "visible",
            }}
          >
            <path
              d="M 10 95 Q 130 70 250 92 Q 380 115 490 82
                 M 490 108 Q 360 132 240 110 Q 120 90 14 118"
              fill="none"
              stroke="#FF2D2D"
              strokeWidth={16}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - strike}
              style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.3))" }}
            />
          </svg>
        </div>

        {/* Terrifying? written letter by letter */}
        <div
          style={{
            marginTop: 14,
            fontSize: 100,
            fontWeight: 900,
            color: "#FF2D2D",
            WebkitTextStroke: "6px #1a1a1a",
            paintOrder: "stroke fill",
            textShadow: "0 8px 0 rgba(0,0,0,0.35)",
            transform: "rotate(2deg)",
            whiteSpace: "nowrap",
          }}
        >
          {WORD.split("").map((ch, i) => {
            const letterIn = spring({
              frame: Math.max(0, frame - Math.round((T_WRITE + i * 0.07) * fps)),
              fps,
              config: { damping: 12, stiffness: 220 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: letterIn,
                  transform: `translateY(${interpolate(letterIn, [0, 1], [24, 0])}px) scale(${interpolate(letterIn, [0, 1], [0.5, 1])})`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
