import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ExoplanetLava } from "./planets/ExoplanetLava";
import { ExoplanetGasGiant } from "./planets/ExoplanetGasGiant";
import { ExoplanetIce } from "./planets/ExoplanetIce";

const PopIn: React.FC<{
  delayFrames: number;
  children: React.ReactNode;
}> = ({ delayFrames, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 12, stiffness: 110 },
  });
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.3, 1])})`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Three different exoplanets popping in around the frame edges for the
 * first "exoplanets" mention. Transparent; keeps the center clear.
 */
export const ExoplanetTrio: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 10, top: 340 }}>
        <PopIn delayFrames={0}>
          <ExoplanetLava size={290} />
        </PopIn>
      </div>
      <div style={{ position: "absolute", right: -20, top: 480 }}>
        <PopIn delayFrames={8}>
          <ExoplanetGasGiant size={360} />
        </PopIn>
      </div>
      <div style={{ position: "absolute", left: 30, top: 1150 }}>
        <PopIn delayFrames={16}>
          <ExoplanetIce size={270} />
        </PopIn>
      </div>
    </AbsoluteFill>
  );
};
