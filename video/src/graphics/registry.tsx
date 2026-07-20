import React from "react";
import { TransitMethod } from "./TransitMethod";
import { SpySatellite } from "./SpySatellite";
import { Spectroscopy } from "./Spectroscopy";
import { TitleCard } from "./TitleCard";
import { TitleCardOverlay } from "./TitleCardOverlay";
import { ExoplanetTrio } from "./ExoplanetTrio";
import { EarthEscape } from "./EarthEscape";
import { NancyIntro } from "./NancyIntro";
import { ScientistLifetime } from "./ScientistLifetime";
import { CoolCrossout } from "./CoolCrossout";
import { TelescopeFlip } from "./TelescopeFlip";
import { EndCredits } from "./EndCredits";

export const GRAPHICS: Record<string, React.FC<{ params?: Record<string, unknown> }>> = {
  TransitMethod: () => <TransitMethod />,
  SpySatellite: () => <SpySatellite />,
  Spectroscopy: () => <Spectroscopy />,
  TitleCard: () => <TitleCard />,
  TitleCardOverlay: () => <TitleCardOverlay />,
  NancyIntro: () => <NancyIntro />,
  ExoplanetTrio: () => <ExoplanetTrio />,
  EarthEscape: () => <EarthEscape />,
  ScientistLifetime: () => <ScientistLifetime />,
  CoolCrossout: () => <CoolCrossout />,
  TelescopeFlip: () => <TelescopeFlip />,
  EndCredits: () => <EndCredits />,
};

export function renderGraphic(
  generator: string,
  params: Record<string, unknown> = {},
): React.ReactNode {
  const Comp = GRAPHICS[generator];
  if (!Comp) {
    return (
      <div
        style={{
          color: "white",
          fontSize: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        Unknown graphic: {generator}
      </div>
    );
  }
  return <Comp params={params} />;
}
