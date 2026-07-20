import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NancyGraceRoman } from "./title/NancyGraceRoman";
import { UncleClam } from "./spy/UncleClam";
import { Schrodinger } from "./characters/Schrodinger";
import { LindaleDigital } from "./characters/LindaleDigital";

/**
 * End credits: character roll near the top of frame. Each character slides
 * in from the left, name + tagline fade in beside them, hold, then the
 * whole stack scrolls up a step — entries fade to transparent as they
 * approach the top edge.
 */

const STEP_PX = 215;
const ACTIVE_Y = 330; // top of the active entry; host's head starts ~y560
const STEP_TIMES = [7.0, 14.0, 21.0, 29.3]; // component-relative seconds

const OUTLINE_5 =
  "5px 0 #000, -5px 0 #000, 0 5px #000, 0 -5px #000, 4px 4px #000, -4px -4px #000, 4px -4px #000, -4px 4px #000, 0 8px 18px rgba(0,0,0,0.55)";
const OUTLINE_4 =
  "4px 0 #000, -4px 0 #000, 0 4px #000, 0 -4px #000, 3px 3px #000, -3px -3px #000, 3px -3px #000, -3px 3px #000, 0 6px 14px rgba(0,0,0,0.5)";

type CreditEntry = {
  name: string;
  tagline: string;
  /** Seconds (component-relative) when the character starts sliding in. */
  enterAt: number;
  /** Reserved width for the character column. */
  charW: number;
  /** p = entrance progress 0..1 */
  char: (p: number) => React.ReactNode;
};

const ENTRIES: CreditEntry[] = [
  {
    name: "Nancy Grace Roman",
    tagline: "The Mother of Hubble",
    enterAt: 0.5,
    charW: 150,
    char: () => <NancyGraceRoman size={140} />,
  },
  {
    name: "Uncle Clam",
    tagline: "Tax, Spend, Spy, Repeat",
    enterAt: 7.5,
    charW: 140,
    char: () => <UncleClam size={120} racing gobble={0} />,
  },
  {
    name: "Schrödinger D. Katt",
    tagline: "Chief Chaos Officer",
    enterAt: 14.5,
    charW: 190,
    char: (p) => (
      <Schrodinger
        size={190}
        pose={p >= 0.92 ? "idle" : "scurry"}
        emotion={p >= 0.92 ? "sly" : "neutral"}
      />
    ),
  },
  {
    name: "Lindale Digital",
    tagline: "AI editing & animation",
    enterAt: 21.5,
    charW: 150,
    char: () => <LindaleDigital size={140} />,
  },
];

export const EndCredits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const stepSpring = (at: number) =>
    spring({
      frame: Math.max(0, frame - Math.round(at * fps)),
      fps,
      config: { damping: 14, stiffness: 90 },
    });

  const scrollOffset =
    STEP_PX * STEP_TIMES.reduce((acc, at) => acc + stepSpring(at), 0);

  // Safety fade once the final scroll-off is underway
  const globalFade = interpolate(t, [29.3, 30.6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: globalFade }}>
      <style>{`
        @font-face {
          font-family: 'Montserrat';
          src: url('${staticFile("fonts/Montserrat-ExtraBold.ttf")}');
          font-weight: 800;
          font-style: normal;
        }
      `}</style>
      {ENTRIES.map((entry, i) => {
        const screenY = ACTIVE_Y + i * STEP_PX - scrollOffset;
        // Fade to transparent as the entry's top approaches the frame top
        const posAlpha = interpolate(screenY, [-40, 280], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const enterSpring = spring({
          frame: Math.max(0, frame - Math.round(entry.enterAt * fps)),
          fps,
          config: { damping: 13, stiffness: 120 },
        });
        if (frame < Math.round(entry.enterAt * fps)) return null;

        const slideX = interpolate(enterSpring, [0, 1], [-450, 0]);

        const nameIn = interpolate(
          t,
          [entry.enterAt + 0.7, entry.enterAt + 0.95],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const taglineIn = interpolate(
          t,
          [entry.enterAt + 1.2, entry.enterAt + 1.5],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={entry.name}
            style={{
              position: "absolute",
              left: 50,
              top: screenY,
              width: 980,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              opacity: posAlpha * enterSpring,
            }}
          >
            <div
              style={{
                width: entry.charW,
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                transform: `translateX(${slideX}px)`,
              }}
            >
              {entry.char(enterSpring)}
            </div>
            <div
              style={{
                marginLeft: 24,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
                fontWeight: 800,
              }}
            >
              <div
                style={{
                  fontSize: 52,
                  color: "#FFFFFF",
                  textShadow: OUTLINE_5,
                  letterSpacing: "0.01em",
                  opacity: nameIn,
                  transform: `translateX(${interpolate(nameIn, [0, 1], [-24, 0])}px)`,
                }}
              >
                {entry.name}
              </div>
              <div
                style={{
                  fontSize: 34,
                  color: "#FFD400",
                  fontStyle: "italic",
                  textShadow: OUTLINE_4,
                  opacity: taglineIn,
                  transform: `translateY(${interpolate(taglineIn, [0, 1], [10, 0])}px)`,
                }}
              >
                {entry.tagline}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
