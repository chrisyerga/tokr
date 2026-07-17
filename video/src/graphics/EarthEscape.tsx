import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Earth } from "./planets/Earth";
import { ExoplanetLife, StickFigure } from "./title/ExoplanetLife";
import { NancyGraceRoman } from "./title/NancyGraceRoman";

// Launch pad (on Earth) and destination (populated exoplanet), in output px.
const EARTH_POS = { x: 220, y: 1380 };
const PLANET_POS = { x: 850, y: 640 };
// Nancy stands just left of the destination, claiming credit.
const NANCY_POS = { x: 520, y: 720 };
// Control point pulls the flight arc out to the left, over the frame edge.
const ARC_CTRL = { x: 120, y: 900 };

type Traveler = {
  launchAt: number; // seconds after overlay start
  flightSec: number;
  scale: number;
  wobble: number;
};

const TRAVELERS: Traveler[] = [
  { launchAt: 0.6, flightSec: 2.2, scale: 1, wobble: 0 },
  { launchAt: 1.2, flightSec: 2.4, scale: 0.85, wobble: 1.7 },
  { launchAt: 1.8, flightSec: 2.0, scale: 0.95, wobble: 3.1 },
  { launchAt: 2.5, flightSec: 2.3, scale: 0.8, wobble: 4.6 },
];

function bezier(p: number) {
  const q = 1 - p;
  return {
    x: q * q * EARTH_POS.x + 2 * q * p * ARC_CTRL.x + p * p * PLANET_POS.x,
    y: q * q * EARTH_POS.y + 2 * q * p * ARC_CTRL.y + p * p * PLANET_POS.y,
  };
}

const FlyingFigure: React.FC<{ traveler: Traveler; t: number }> = ({
  traveler,
  t,
}) => {
  const p = interpolate(
    t,
    [traveler.launchAt, traveler.launchAt + traveler.flightSec],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (p <= 0 || p >= 1) return null;

  const pos = bezier(p);
  const ahead = bezier(Math.min(1, p + 0.02));
  const angle =
    (Math.atan2(ahead.y - pos.y, ahead.x - pos.x) * 180) / Math.PI + 90;
  const wobble = Math.sin(t * Math.PI * 2 * 1.3 + traveler.wobble) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x - 20,
        top: pos.y - 30,
        transform: `rotate(${angle + wobble}deg) scale(${traveler.scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {/* Rocket flame behind the figure's feet */}
      <svg
        viewBox="0 0 40 24"
        width={40}
        height={24}
        style={{ position: "absolute", top: 56, left: 0 }}
      >
        <path
          d={`M 14 0 L 20 ${16 + Math.sin(t * 40 + traveler.wobble) * 5} L 26 0 Z`}
          fill="#ff9b45"
        />
        <path
          d={`M 17 0 L 20 ${9 + Math.sin(t * 47 + traveler.wobble) * 3} L 23 0 Z`}
          fill="#ffe08a"
        />
      </svg>
      <StickFigure wavePhase={t + traveler.wobble} waving />
    </div>
  );
};

/**
 * "Eject button" gag: stick figures blast off from Earth (lower-left)
 * and arc across to the populated exoplanet (upper-right). Nancy Grace
 * Roman waits at the destination, smugly claiming "I found it!".
 * Transparent overlay; keeps the center of the frame mostly clear.
 */
export const EarthEscape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const earthIn = spring({ frame, fps, config: { damping: 13, stiffness: 90 } });
  const planetIn = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 13, stiffness: 90 },
  });
  // Absolute ~frame 795 / "Roman" at 26.4s; overlay starts at 21.5s → ~4.9s in.
  const nancyIn = spring({
    frame: Math.max(0, frame - Math.round(4.9 * fps)),
    fps,
    config: { damping: 13, stiffness: 90 },
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Earth, lower-left */}
      <div
        style={{
          position: "absolute",
          left: EARTH_POS.x - 160,
          top: EARTH_POS.y - 160,
          opacity: earthIn,
          transform: `translateX(${interpolate(earthIn, [0, 1], [-300, 0])}px)`,
        }}
      >
        <Earth size={320} />
      </div>

      {/* Populated exoplanet, upper-right */}
      <div
        style={{
          position: "absolute",
          left: PLANET_POS.x - 150,
          top: PLANET_POS.y - 150,
          opacity: planetIn,
          transform: `translateX(${interpolate(planetIn, [0, 1], [300, 0])}px)`,
        }}
      >
        <ExoplanetLife size={300} />
      </div>

      {/* Nancy Grace Roman — smugly claiming the find */}
      <div
        style={{
          position: "absolute",
          left: NANCY_POS.x - 130,
          top: NANCY_POS.y - 175,
          opacity: nancyIn,
          transform: `translateX(${interpolate(nancyIn, [0, 1], [-200, 0])}px)`,
        }}
      >
        <NancyGraceRoman size={260} speech="Me. I did that $#!%." speechAt={5.25} />
      </div>

      {/* Escapees */}
      {TRAVELERS.map((tr, i) => (
        <FlyingFigure key={i} traveler={tr} t={t} />
      ))}
    </AbsoluteFill>
  );
};
