export type SubtitleWord = {
  text: string;
  start: number;
  end: number;
  /** Name of a component in graphics/flair/registry (e.g. "Goldilocks"). */
  flair?: string;
  /**
   * When true, karaoke shows a scrambling red "@%$!" instead of `text`.
   * Useful for bleeping swears while keeping timing.
   */
  censor?: boolean;
};

export type SubtitleChunk = {
  start: number;
  end: number;
  words: SubtitleWord[];
};

export type Overlay = {
  id: string;
  generator: string;
  mode: "fullscreen" | "overlay";
  start: number;
  end: number;
  params: Record<string, unknown>;
};

export type SubtitleStyle = {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  color: string;
  highlightColor: string;
  outlineColor: string;
  outlineWidth: number;
  bottomOffset: number;
  maxWordsPerChunk: number;
};

export type EditDoc = {
  version: 1;
  title: string;
  fps: number;
  width: number;
  height: number;
  overlays: Overlay[];
  subtitleStyle: SubtitleStyle;
};
