export type SubtitleWord = {
  text: string;
  start: number;
  end: number;
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
