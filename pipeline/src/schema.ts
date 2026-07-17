import { z } from "zod";

export const AssetSchema = z.object({
  id: z.string(),
  path: z.string(),
  duration: z.number().optional(),
});

export const TimelineClipSchema = z.object({
  id: z.string(),
  asset: z.string(),
  srcIn: z.number().nonnegative(),
  srcOut: z.number().positive(),
  note: z.string().optional(),
});

export const OverlayModeSchema = z.enum(["fullscreen", "overlay"]);

export const OverlaySchema = z.object({
  id: z.string(),
  generator: z.string(),
  mode: OverlayModeSchema.default("fullscreen"),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  params: z.record(z.unknown()).default({}),
});

export const SubtitleStyleSchema = z.object({
  fontFamily: z.string().default("Montserrat"),
  fontWeight: z.number().default(800),
  fontSize: z.number().default(64),
  color: z.string().default("#FFFFFF"),
  highlightColor: z.string().default("#FFD400"),
  outlineColor: z.string().default("#000000"),
  outlineWidth: z.number().default(8),
  bottomOffset: z.number().default(280),
  maxWordsPerChunk: z.number().default(4),
});

export const EditSchema = z.object({
  version: z.literal(1),
  title: z.string(),
  fps: z.number().default(30),
  width: z.number().default(1080),
  height: z.number().default(1920),
  assets: z.array(AssetSchema),
  timeline: z.array(TimelineClipSchema),
  overlays: z.array(OverlaySchema).default([]),
  subtitleStyle: SubtitleStyleSchema.default({}),
  audio: z
    .object({
      loudnorm: z.boolean().default(true),
      targetLufs: z.number().default(-16),
      crossfadeMs: z.number().default(40),
    })
    .default({}),
});

export type Asset = z.infer<typeof AssetSchema>;
export type TimelineClip = z.infer<typeof TimelineClipSchema>;
export type Overlay = z.infer<typeof OverlaySchema>;
export type SubtitleStyle = z.infer<typeof SubtitleStyleSchema>;
export type Edit = z.infer<typeof EditSchema>;

export const WordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
  probability: z.number().optional(),
});

export const TranscriptSegmentSchema = z.object({
  id: z.number().optional(),
  seek: z.number().optional(),
  start: z.number(),
  end: z.number(),
  text: z.string(),
  words: z.array(WordSchema).optional(),
});

export const TranscriptSchema = z.object({
  text: z.string(),
  segments: z.array(TranscriptSegmentSchema).optional(),
  words: z.array(WordSchema).optional(),
  language: z.string().optional(),
});

export type Word = z.infer<typeof WordSchema>;
export type Transcript = z.infer<typeof TranscriptSchema>;

export const SubtitleWordSchema = z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
  flair: z.string().optional(),
  censor: z.boolean().optional(),
});

export const SubtitleChunkSchema = z.object({
  start: z.number(),
  end: z.number(),
  words: z.array(SubtitleWordSchema),
});

export type SubtitleWord = z.infer<typeof SubtitleWordSchema>;
export type SubtitleChunk = z.infer<typeof SubtitleChunkSchema>;
