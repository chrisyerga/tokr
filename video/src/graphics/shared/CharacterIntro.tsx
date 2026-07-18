import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type FactoidSpec = {
  text: string;
  delaySec: number;
  x: number;
  y: number;
  rotate: number;
  color?: string;
};

/** Slam-down factoid card (Nancy-intro style). */
export const FactoidSlam: React.FC<{
  text: string;
  delaySec: number;
  rotate: number;
  color?: string;
  fontSize?: number;
}> = ({ text, delaySec, rotate, color = "#FF88aa", fontSize = 42 }) => {
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
        fontSize,
        lineHeight: 1.15,
        color,
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

/** Character name plate — slams in, then factoids follow. */
export const CharacterNamePlate: React.FC<{
  name: string;
  delaySec?: number;
  color?: string;
  fontSize?: number;
}> = ({ name, delaySec = 0, color = "#FFD400", fontSize = 64 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - Math.round(delaySec * fps)),
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });

  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${interpolate(s, [0, 1], [-8, -2])}deg)`,
        fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
        fontWeight: 900,
        fontSize,
        lineHeight: 1.1,
        color,
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow:
          "6px 0 #000, -6px 0 #000, 0 6px #000, 0 -6px #000, 5px 5px #000, -5px -5px #000, 5px -5px #000, -5px 5px #000, 0 10px 22px rgba(0,0,0,0.6)",
        letterSpacing: "0.02em",
      }}
    >
      {name}
    </div>
  );
};

/**
 * Name drop + factoid cards. Mount inside a Sequence timed to character entrance.
 * `fadeOutSec` fades the whole intro before the gag continues.
 */
export const CharacterIntro: React.FC<{
  name: string;
  nameColor?: string;
  nameFontSize?: number;
  nameX: number;
  nameY: number;
  factoids: FactoidSpec[];
  /** Seconds after mount when intro begins fading out. */
  fadeOutSec?: number;
  fadeDurationSec?: number;
}> = ({
  name,
  nameColor = "#FFD400",
  nameFontSize = 64,
  nameX,
  nameY,
  factoids,
  fadeOutSec = 3.2,
  fadeDurationSec = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fade = interpolate(
    t,
    [fadeOutSec, fadeOutSec + fadeDurationSec],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: nameX, top: nameY }}>
        <CharacterNamePlate name={name} color={nameColor} fontSize={nameFontSize} />
      </div>
      {factoids.map((f) => (
        <div key={f.text} style={{ position: "absolute", left: f.x, top: f.y }}>
          <FactoidSlam
            text={f.text}
            delaySec={f.delaySec}
            rotate={f.rotate}
            color={f.color}
          />
        </div>
      ))}
    </AbsoluteFill>
  );
};
