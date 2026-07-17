import React from "react";
import { AbsoluteFill } from "remotion";
import { EntityIn, TitleLines } from "./TitleCard";
import { RomanTelescope } from "./title/RomanTelescope";
import { SpyCharacter } from "./title/SpyCharacter";
import { ExoplanetLife } from "./title/ExoplanetLife";

/**
 * Transparent variant of the title card rendered over the footage.
 * Entities hug the frame edges so the speaker's face stays clear.
 */
export const TitleCardOverlay: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <TitleLines />

      {/* Telescope: upper-left, below the title */}
      <div style={{ position: "absolute", left: 99, top: 500 }}>
        <EntityIn delayFrames={8} fromX={-300}>
          <RomanTelescope size={310} />
        </EntityIn>
      </div>

      {/* Spy: lower-left edge */}
      <div style={{ position: "absolute", left: 50, top: 1140 }}>
        <EntityIn delayFrames={16} fromX={-260}>
          <SpyCharacter size={230} />
        </EntityIn>
      </div>

      {/* Exoplanet: lower-right edge */}
      <div style={{ position: "absolute", right: 50, top: 1250 }}>
        <EntityIn delayFrames={24} fromX={320}>
          <ExoplanetLife size={310} />
        </EntityIn>
      </div>
    </AbsoluteFill>
  );
};
