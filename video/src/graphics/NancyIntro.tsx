import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NancyGraceRoman } from "./title/NancyGraceRoman";

const FACTOIDS = [
  { text: "NASA's first\nChief of Astronomy\n(1959-1967)", delaySec: 0.55, x: 40, y: 380, rotate: -6 },
  { text: 'Nicknamed the "Mother of Hubble"', delaySec: 1.15, x: 620, y: 520, rotate: 5 },
  { text: "Famous for knitting\nduring meetings", delaySec: 1.75, x: 60, y: 1180, rotate: -3 },
] as const;

const FactoidSlam: React.FC<{
  text: string;
  delaySec: number;
  rotate: number;
}> = ({ text, delaySec, rotate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - Math.round(delaySec * fps)),
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.7 },
  });
  const y = interpolate(s, [0, 1], [-180, 0]);
  const scale = interpolate(s, [0, 1], [1.35, 1]);

  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`,
        fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
        fontWeight: 800,
        fontSize: 42,
        lineHeight: 1.15,
        color: "#FFD400",
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow:
          "5px 0 #000, -5px 0 #000, 0 5px #000, 0 -5px #000, 4px 4px #000, -4px -4px #000, 4px -4px #000, -4px 4px #000, 0 8px 18px rgba(0,0,0,0.55)",
        letterSpacing: "0.01em",
        maxWidth: 420,
      }}
    >
      {text}
    </div>
  );
};

/**
 * First "Nancy Grace Roman" beat: she slides in after the title card,
 * then factoids slam down around her. Center stays clear for the speaker.
 */
export const NancyIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nancyIn = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Nancy — upper-right edge */}
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 720,
          opacity: nancyIn,
          transform: `translateX(${interpolate(nancyIn, [0, 1], [280, 0])}px) scale(${interpolate(nancyIn, [0, 1], [0.85, 1])})`,
        }}
      >
        <NancyGraceRoman size={300} />
      </div>

      {FACTOIDS.map((f) => (
        <div
          key={f.text}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
          }}
        >
          <FactoidSlam text={f.text} delaySec={f.delaySec} rotate={f.rotate} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
