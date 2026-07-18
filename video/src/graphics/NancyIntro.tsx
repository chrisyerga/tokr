import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NancyGraceRoman } from "./title/NancyGraceRoman";
import { Schrodinger } from "./characters/Schrodinger";
import { KnittingNeedles, PinkYarnBall } from "./props/KnittingProps";

const FACTOIDS = [
  { text: "NASA's first\nChief of Astronomy\n(1959-1967)", delaySec: 0.55, x: 40, y: 380, rotate: -6 },
  { text: 'Nicknamed the "Mother of Hubble"', delaySec: 1.15, x: 620, y: 520, rotate: 5 },
  { text: "Famous for knitting\nduring meetings", delaySec: 1.75, x: 60, y: 1180, rotate: -3 },
] as const;

const KNITTING_FACTOID_DELAY = 1.75;
/** Props pop in right after the knitting factoid lands. */
const PROPS_DELAY = 2.05;
const CAT_RUN_START = 2.35;
const CAT_ARRIVE = 3.2;

const NANCY_RIGHT = 30;
const NANCY_TOP = 720;
const NANCY_SIZE = 300;
const NANCY_HEIGHT = NANCY_SIZE * 1.25;
/** Center column under Nancy (for cat run target). */
const yarnCenterX = (width: number) =>
  width - NANCY_RIGHT - NANCY_SIZE / 2 - 55;
const YARN_Y = NANCY_TOP + NANCY_HEIGHT + 25 + 108;

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
        color: "#FF88aa",
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
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const yarnX = yarnCenterX(width);

  const nancyIn = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  const propsIn = spring({
    frame: Math.max(0, frame - Math.round(PROPS_DELAY * fps)),
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.8 },
  });

  const catRunP = interpolate(t, [CAT_RUN_START, CAT_ARRIVE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const catVisible = t >= CAT_RUN_START;
  const catX = interpolate(catRunP, [0, 1], [-140, yarnX - 160]);
  const catY = interpolate(catRunP, [0, 1], [YARN_Y + 40, YARN_Y - 20]);
  const catPose = catRunP >= 0.92 ? "grab" : "scurry";

  const yarnWobble =
    catRunP >= 0.85 ? Math.sin(t * Math.PI * 2 * 5) * (8 + catRunP * 6) : 0;
  const yarnRoll = catRunP >= 0.85 ? (catRunP - 0.85) * 55 : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Nancy — upper-right edge */}
      <div
        style={{
          position: "absolute",
          right: NANCY_RIGHT,
          top: NANCY_TOP,
          opacity: nancyIn,
          transform: `translateX(${interpolate(nancyIn, [0, 1], [280, 0])}px) scale(${interpolate(nancyIn, [0, 1], [0.85, 1])})`,
        }}
      >
        <NancyGraceRoman size={NANCY_SIZE} />

        {/* Knitting needles + yarn — directly under Nancy */}
        {t >= KNITTING_FACTOID_DELAY && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: NANCY_HEIGHT - 70,
              transform: `translateX(-50%) scale(${interpolate(propsIn, [0, 1], [0.5, 1])})`,
              opacity: propsIn,
              zIndex: 4,
            }}
          >
            <div style={{ position: "relative", width: 150, height: 218 }}>
              <div style={{ position: "absolute", left: 0, top: 20 }}>
                <KnittingNeedles size={150} />
              </div>
              <div style={{ position: "absolute", left: 20, top: 108 }}>
                <PinkYarnBall size={110} wobble={yarnWobble} rollX={yarnRoll} />
              </div>
            </div>
          </div>
        )}
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

      {/* Schrödinger dashes in to play with the yarn */}
      {catVisible && (
        <div
          style={{
            position: "absolute",
            left: catX,
            top: catY,
            zIndex: 5,
            opacity: interpolate(catRunP, [0, 0.08], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Schrodinger size={200} pose={catPose} emotion={catPose === "grab" ? "sly" : "neutral"} />
        </div>
      )}
    </AbsoluteFill>
  );
};
