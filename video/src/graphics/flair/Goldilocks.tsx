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
 * Goldilocks flair: head rocks back and forth at the top;
 * the three bears sit underneath.
 * PNGs are black-backed — screen blend knocks out the black.
 */
export const Goldilocks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  // Rock ~±10° on a ~1.2s cycle
  const rock = Math.sin((frame / fps) * Math.PI * 2 * 0.85) * 10;
  const bob = Math.sin((frame / fps) * Math.PI * 2 * 1.1) * 6;

  const bearsEnter = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const bearsScale = interpolate(bearsEnter, [0, 1], [0.85, 1]);
  const bearsY = interpolate(bearsEnter, [0, 1], [40, 0]);

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
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.7, 1])})`,
        }}
      >
        <div
          style={{
            width: 560,
            transform: `rotate(${rock}deg) translateY(${bob}px)`,
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
