import React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SubtitleChunk, SubtitleStyle } from "./types";

type Props = {
  chunks: SubtitleChunk[];
  style: SubtitleStyle;
};

function activeChunk(chunks: SubtitleChunk[], t: number): SubtitleChunk | null {
  for (const c of chunks) {
    if (t >= c.start && t < c.end + 0.08) return c;
  }
  return null;
}

export const KaraokeSubtitles: React.FC<Props> = ({ chunks, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunk = activeChunk(chunks, t);

  if (!chunk) return null;

  const enter = interpolate(t, [chunk.start, chunk.start + 0.08], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: style.bottomOffset,
        pointerEvents: "none",
      }}
    >
      <style>{`
        @font-face {
          font-family: 'Montserrat';
          src: url('${staticFile("fonts/Montserrat-ExtraBold.ttf")}');
          font-weight: 800;
          font-style: normal;
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.28em",
          maxWidth: "92%",
          transform: `scale(${enter})`,
          fontFamily: `"${style.fontFamily}", "Arial Black", Impact, sans-serif`,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          lineHeight: 1.15,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.01em",
        }}
      >
        {chunk.words.map((w, i) => {
          const isActive = t >= w.start && t < w.end + 0.05;
          const spoken = t >= w.end;
          const scale = isActive
            ? interpolate(t, [w.start, w.start + 0.06], [1, 1.12], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

          return (
            <span
              key={`${chunk.start}-${i}-${w.text}`}
              style={{
                color: isActive || spoken ? style.highlightColor : style.color,
                transform: `scale(${scale})`,
                display: "inline-block",
                textShadow: `
                  ${style.outlineWidth}px 0 ${style.outlineColor},
                  -${style.outlineWidth}px 0 ${style.outlineColor},
                  0 ${style.outlineWidth}px ${style.outlineColor},
                  0 -${style.outlineWidth}px ${style.outlineColor},
                  ${style.outlineWidth}px ${style.outlineWidth}px ${style.outlineColor},
                  -${style.outlineWidth}px -${style.outlineWidth}px ${style.outlineColor},
                  ${style.outlineWidth}px -${style.outlineWidth}px ${style.outlineColor},
                  -${style.outlineWidth}px ${style.outlineWidth}px ${style.outlineColor},
                  0 6px 18px rgba(0,0,0,0.65)
                `,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
