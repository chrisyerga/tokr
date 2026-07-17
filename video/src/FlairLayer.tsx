import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { renderFlair } from "./graphics/flair/registry";
import type { SubtitleChunk } from "./types";

type FlairEvent = {
  id: string;
  name: string;
  start: number;
  end: number;
};

/** Linger after the word so the gag can land. */
const FLAIR_LINGER_SEC = 2.2;

function collectFlairEvents(chunks: SubtitleChunk[]): FlairEvent[] {
  const events: FlairEvent[] = [];

  for (const chunk of chunks) {
    for (const word of chunk.words) {
      const name = word.flair?.trim();
      if (!name) continue;
      events.push({
        id: `${name}-${word.start}`,
        name,
        start: word.start,
        end: Math.max(word.end + FLAIR_LINGER_SEC, chunk.end + 0.4),
      });
    }
  }

  return events;
}

type Props = {
  chunks: SubtitleChunk[];
};

export const FlairLayer: React.FC<Props> = ({ chunks }) => {
  const { fps } = useVideoConfig();
  const events = useMemo(() => collectFlairEvents(chunks), [chunks]);

  return (
    <AbsoluteFill style={{ zIndex: 8, pointerEvents: "none" }}>
      {events.map((ev) => {
        const from = Math.round(ev.start * fps);
        const durationInFrames = Math.max(
          1,
          Math.round((ev.end - ev.start) * fps),
        );
        return (
          <Sequence key={ev.id} from={from} durationInFrames={durationInFrames}>
            {renderFlair(ev.name)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
