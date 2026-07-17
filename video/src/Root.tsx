import React from "react";
import { Composition, staticFile } from "remotion";
import { Final, type FinalProps } from "./Final";
import { TransitMethod } from "./graphics/TransitMethod";
import { SpySatellite } from "./graphics/SpySatellite";
import { Spectroscopy } from "./graphics/Spectroscopy";
import { Goldilocks } from "./graphics/flair/Goldilocks";
import { TitleCard } from "./graphics/TitleCard";
import { ExoplanetTrio } from "./graphics/ExoplanetTrio";
import { EarthEscape } from "./graphics/EarthEscape";
import type { EditDoc, SubtitleChunk } from "./types";

const defaultStyle = {
  fontFamily: "Montserrat",
  fontWeight: 800,
  fontSize: 64,
  color: "#FFFFFF",
  highlightColor: "#FFD400",
  outlineColor: "#000000",
  outlineWidth: 8,
  bottomOffset: 280,
  maxWordsPerChunk: 4,
};

const emptyEdit: EditDoc = {
  version: 1,
  title: "Roman",
  fps: 30,
  width: 1080,
  height: 1920,
  overlays: [],
  subtitleStyle: defaultStyle,
};

const defaultProps: FinalProps = {
  edit: emptyEdit,
  subtitles: [],
  baseVideo: "base.mp4",
};

async function loadJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(staticFile(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Final"
        component={Final}
        durationInFrames={30 * 60 * 5}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={async ({ props }) => {
          const edit =
            (await loadJson<EditDoc>("edit.json")) ?? props.edit ?? emptyEdit;
          const subtitles =
            (await loadJson<SubtitleChunk[]>("subtitles.json")) ??
            props.subtitles ??
            [];

          // Prefer duration from cut-meta if present
          const meta = await loadJson<{ duration: number }>("cut-meta.json");
          const durationSec = meta?.duration ?? 60;
          const durationInFrames = Math.max(1, Math.ceil(durationSec * edit.fps));

          return {
            durationInFrames,
            fps: edit.fps,
            width: edit.width,
            height: edit.height,
            props: {
              ...props,
              edit,
              subtitles,
              baseVideo: props.baseVideo || "base.mp4",
            },
          };
        }}
      />

      <Composition
        id="TransitMethodPreview"
        component={TransitMethod}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SpySatellitePreview"
        component={SpySatellite}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SpectroscopyPreview"
        component={Spectroscopy}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="GoldilocksFlairPreview"
        component={Goldilocks}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TitleCardPreview"
        component={TitleCard}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ExoplanetTrioPreview"
        component={ExoplanetTrio}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EarthEscapePreview"
        component={EarthEscape}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
