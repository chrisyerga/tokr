import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { KaraokeSubtitles } from "./KaraokeSubtitles";
import { renderGraphic } from "./graphics/registry";
import type { EditDoc, Overlay, SubtitleChunk } from "./types";

export type FinalProps = {
  edit: EditDoc;
  subtitles: SubtitleChunk[];
  baseVideo: string;
};

export const Final: React.FC<FinalProps> = ({ edit, subtitles, baseVideo }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(baseVideo)} />

      {edit.overlays.map((overlay: Overlay) => {
        const from = Math.round(overlay.start * fps);
        const durationInFrames = Math.max(
          1,
          Math.round((overlay.end - overlay.start) * fps),
        );
        return (
          <Sequence key={overlay.id} from={from} durationInFrames={durationInFrames}>
            <AbsoluteFill style={{ zIndex: overlay.mode === "fullscreen" ? 5 : 3 }}>
              {renderGraphic(overlay.generator, overlay.params)}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      <AbsoluteFill style={{ zIndex: 10 }}>
        <KaraokeSubtitles chunks={subtitles} style={edit.subtitleStyle} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
