import { z } from "zod";

export const BeatHintSchema = z.object({
  id: z.string(),
  /** Terms/phrases that should appear somewhere in this beat's chosen clip(s). */
  mustInclude: z.array(z.string()).default([]),
  /** Optional: only consider these asset ids for this beat. */
  preferAssets: z.array(z.string()).default([]),
  /** Soft max seconds for this beat (best single clip usually). */
  maxSec: z.number().optional(),
});

export const OverlayHintSchema = z.object({
  id: z.string(),
  generator: z.string(),
  mode: z.enum(["fullscreen", "overlay"]).default("fullscreen"),
  /** Attach overlay to timeline span covering clips whose text matches any of these. */
  match: z.array(z.string()).min(1),
  params: z.record(z.unknown()).default({}),
});

/** Overlay pinned to absolute output times (e.g. title card at 0s). */
export const FixedOverlaySchema = z.object({
  id: z.string(),
  generator: z.string(),
  mode: z.enum(["fullscreen", "overlay"]).default("fullscreen"),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  params: z.record(z.unknown()).default({}),
});

export const HintsSchema = z.object({
  version: z.literal(1),
  title: z.string(),
  assetsGlob: z.string().default("roman-assets/*.MOV"),
  transcriptsDir: z.string().default("transcripts"),
  targetDurationSec: z
    .object({
      min: z.number().default(0),
      max: z.number().default(600),
    })
    .default({}),
  /** Global phrases that must appear somewhere in the final cut. */
  mustInclude: z.array(z.string()).default([]),
  /** Drop any clip whose transcript contains these (case-insensitive). */
  mustExclude: z.array(z.string()).default([]),
  preferAssets: z.array(z.string()).default([]),
  excludeAssets: z.array(z.string()).default([]),
  beats: z.array(BeatHintSchema).default([]),
  overlayHints: z.array(OverlayHintSchema).default([]),
  fixedOverlays: z.array(FixedOverlaySchema).default([]),
  /** Template fields copied into the draft edit. */
  fps: z.number().default(30),
  width: z.number().default(1080),
  height: z.number().default(1920),
  subtitleStyle: z.record(z.unknown()).optional(),
  audio: z.record(z.unknown()).optional(),
});

export type Hints = z.infer<typeof HintsSchema>;
export type BeatHint = z.infer<typeof BeatHintSchema>;
export type OverlayHint = z.infer<typeof OverlayHintSchema>;
export type FixedOverlay = z.infer<typeof FixedOverlaySchema>;

export const PatchSchema = z.object({
  version: z.literal(1),
  /** Remove timeline clips by id (e.g. "c_IMG_7975"). */
  remove: z.array(z.string()).default([]),
  /** Swap a clip's asset for another (same trim heuristic applied). */
  replace: z
    .array(
      z.object({
        clipId: z.string(),
        withAsset: z.string(),
      }),
    )
    .default([]),
  /** Adjust srcIn/srcOut on existing clips. */
  trim: z
    .array(
      z.object({
        clipId: z.string(),
        srcIn: z.number().optional(),
        srcOut: z.number().optional(),
      }),
    )
    .default([]),
  /** Insert a clip after another clip id (or at start if after is null). */
  insert: z
    .array(
      z.object({
        afterClipId: z.string().nullable(),
        asset: z.string(),
        srcIn: z.number().optional(),
        srcOut: z.number().optional(),
        note: z.string().optional(),
      }),
    )
    .default([]),
  /** Reorder: list of clip ids in desired order (unlisted clips keep relative order at end). */
  order: z.array(z.string()).optional(),
});

export type Patch = z.infer<typeof PatchSchema>;
