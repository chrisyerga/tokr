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

const CENSOR_COLOR = "#FF2D2D";
const CENSOR_FRAMES = ["@%$!", "#&*!", "$%@#", "*!@$", "@#&%", "!$*%"];

function activeChunk(chunks: SubtitleChunk[], t: number): SubtitleChunk | null {
  for (const c of chunks) {
    if (t >= c.start && t < c.end + 0.08) return c;
  }
  return null;
}

function censorGlyphs(frame: number, active: boolean): string {
  // Scramble faster while the word is being spoken.
  const step = active ? 2 : 4;
  return CENSOR_FRAMES[Math.floor(frame / step) % CENSOR_FRAMES.length]!;
}

/** Fixed-width slot so scrambling glyphs don't reflow the karaoke line. */
const CensorWord: React.FC<{
  frame: number;
  active: boolean;
  color: string;
  textShadow: string;
  scale: number;
  shake: number;
}> = ({ frame, active, color, textShadow, scale, shake }) => {
  const label = censorGlyphs(frame, active);
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        color,
        textShadow,
        transform: `translateX(${shake}px) scale(${scale})`,
      }}
    >
      {/* Hidden copies reserve the max glyph width across all frames. */}
      {CENSOR_FRAMES.map((glyphs) => (
        <span
          key={glyphs}
          aria-hidden
          style={{ gridArea: "1 / 1", visibility: "hidden" }}
        >
          {glyphs}
        </span>
      ))}
      <span style={{ gridArea: "1 / 1" }}>{label}</span>
    </span>
  );
};

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
          gap: "0.55em",
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
          const censored = Boolean(w.censor);
          const scale = isActive
            ? interpolate(t, [w.start, w.start + 0.06], [1, 1.18], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;
          const shake = censored && isActive
            ? Math.sin(frame * 1.8) * 3
            : 0;
          const color = censored
            ? CENSOR_COLOR
            : isActive || spoken
              ? style.highlightColor
              : style.color;
          const textShadow = `
            ${style.outlineWidth}px 0 ${style.outlineColor},
            -${style.outlineWidth}px 0 ${style.outlineColor},
            0 ${style.outlineWidth}px ${style.outlineColor},
            0 -${style.outlineWidth}px ${style.outlineColor},
            ${style.outlineWidth}px ${style.outlineWidth}px ${style.outlineColor},
            -${style.outlineWidth}px -${style.outlineWidth}px ${style.outlineColor},
            ${style.outlineWidth}px -${style.outlineWidth}px ${style.outlineColor},
            -${style.outlineWidth}px ${style.outlineWidth}px ${style.outlineColor},
            0 6px 18px rgba(0,0,0,0.65)
          `;

          if (censored) {
            return (
              <CensorWord
                key={`${chunk.start}-${i}-${w.text}`}
                frame={frame}
                active={isActive}
                color={color}
                textShadow={textShadow}
                scale={scale}
                shake={shake}
              />
            );
          }

          return (
            <span
              key={`${chunk.start}-${i}-${w.text}`}
              style={{
                color,
                transform: `scale(${scale})`,
                display: "inline-block",
                textShadow,
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
