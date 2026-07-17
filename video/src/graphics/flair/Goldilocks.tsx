import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Goldilocks flair: three bears arrive first, then after a beat
 * smug Goldilocks drops in above them and rocks.
 * PNGs are black-backed — screen blend knocks out the black.
 */
export const Goldilocks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bearsEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const bearsScale = interpolate(bearsEnter, [0, 1], [0.85, 1]);
  const bearsY = interpolate(bearsEnter, [0, 1], [50, 0]);

  // Beat after the bears settle, then she slams in smugly.
  const goldieDelay = Math.round(0.75 * fps);
  const goldieEnter = spring({
    frame: Math.max(0, frame - goldieDelay),
    fps,
    config: { damping: 11, stiffness: 200, mass: 0.65 },
  });
  const goldieY = interpolate(goldieEnter, [0, 1], [-120, 0]);
  const goldieScale = interpolate(goldieEnter, [0, 1], [1.25, 1]);

  // Rock only once she's mostly in
  const rock =
    Math.sin((frame / fps) * Math.PI * 2 * 0.85) * 10 * goldieEnter;
  const bob =
    Math.sin((frame / fps) * Math.PI * 2 * 1.1) * 6 * goldieEnter;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 48,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            width: 560,
            opacity: goldieEnter,
            transform: `translateY(${goldieY}px) scale(${goldieScale}) rotate(${rock}deg) translateY(${bob}px)`,
            transformOrigin: "50% 90%",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.45))",
          }}
        >
          <Img
            src={staticFile("flair/goldilocks.png")}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            width: 640,
            marginTop: -12,
            transform: `translateY(${bearsY}px) scale(${bearsScale})`,
            opacity: bearsEnter,
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.45))",
          }}
        >
          <Img
            src={staticFile("flair/three-bears.png")}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
