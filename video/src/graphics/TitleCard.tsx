import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RomanTelescope } from "./title/RomanTelescope";
import { SpyCharacter } from "./title/SpyCharacter";
import { ExoplanetLife } from "./title/ExoplanetLife";

const TITLE_MAIN = [
  { text: "Turning Space Surveillance", color: "#9fd4ff" },
  { text: "into Space Exploration.", color: "#8fe3a5" },
] as const;

const TITLE_SUB =
  "(Named after a badass lady who loved to knit)";

export const TitleLine: React.FC<{
  text: string;
  color: string;
  delayFrames: number;
  fontSize?: number;
}> = ({ text, color, delayFrames, fontSize = 74 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  return (
    <div
      style={{
        fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
        fontWeight: 800,
        fontSize,
        lineHeight: 1.12,
        color,
        textAlign: "center",
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
        textShadow:
          "6px 0 #000, -6px 0 #000, 0 6px #000, 0 -6px #000, 5px 5px #000, -5px -5px #000, 5px -5px #000, -5px 5px #000, 0 8px 24px rgba(0,0,0,0.6)",
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </div>
  );
};

export const EntityIn: React.FC<{
  delayFrames: number;
  fromX: number;
  children: React.ReactNode;
}> = ({ delayFrames, fromX, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 13, stiffness: 90 },
  });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [fromX, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Opening title card: three-line title + telescope, spy, exoplanet. */
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #16224a 0%, #0a0f24 55%, #03040c 100%)",
      }}
    >
      {/* Star field */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: 90 }).map((_, i) => {
          const x = (i * 131) % width;
          const y = (i * 197) % height;
          const twinkle =
            0.35 + 0.65 * ((Math.sin(t * 2 + i * 1.7) + 1) / 2);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={(i % 3) * 0.9 + 0.8}
              fill={`rgba(255,255,255,${twinkle})`}
            />
          );
        })}
      </svg>

      <TitleContent />
    </AbsoluteFill>
  );
};

/** Just the stacked title lines + subtitle. */
export const TitleLines: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 140,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        padding: "0 36px",
      }}
    >
      <TitleLine
        text={TITLE_MAIN[0]!.text}
        color={TITLE_MAIN[0]!.color}
        delayFrames={3}
        fontSize={62}
      />
      <TitleLine
        text={TITLE_MAIN[1]!.text}
        color={TITLE_MAIN[1]!.color}
        delayFrames={10}
        fontSize={62}
      />
      <TitleLine
        text={TITLE_SUB}
        color="#FFD400"
        delayFrames={18}
        fontSize={38}
      />
    </div>
  );
};

/** Title text + the three animated entities, transparent background. */
export const TitleContent: React.FC = () => {
  return (
    <>
      <TitleLines />

      {/* Entities */}
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 0,
          right: 0,
          bottom: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <EntityIn delayFrames={8} fromX={-260}>
          <RomanTelescope size={430} />
        </EntityIn>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 60 }}>
          <EntityIn delayFrames={16} fromX={-200}>
            <SpyCharacter size={300} />
          </EntityIn>
          <EntityIn delayFrames={24} fromX={260}>
            <ExoplanetLife size={400} />
          </EntityIn>
        </div>
      </div>
    </>
  );
};
