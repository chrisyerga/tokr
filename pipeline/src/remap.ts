import type { Edit, TimelineClip, Word } from "./schema.js";

export type OutputSegment = {
  clip: TimelineClip;
  outStart: number;
  outEnd: number;
  duration: number;
};

/** Build output-timeline segments from an edit list. */
export function buildOutputTimeline(edit: Edit): OutputSegment[] {
  let cursor = 0;
  const segments: OutputSegment[] = [];

  for (const clip of edit.timeline) {
    if (clip.srcOut <= clip.srcIn) {
      throw new Error(
        `Clip ${clip.id}: srcOut (${clip.srcOut}) must be > srcIn (${clip.srcIn})`,
      );
    }
    const duration = clip.srcOut - clip.srcIn;
    segments.push({
      clip,
      outStart: cursor,
      outEnd: cursor + duration,
      duration,
    });
    cursor += duration;
  }

  return segments;
}

export function totalDuration(edit: Edit): number {
  const segs = buildOutputTimeline(edit);
  return segs.length === 0 ? 0 : segs[segs.length - 1]!.outEnd;
}

/**
 * Map a source-time word belonging to a given asset into output time.
 * Returns null if the word falls outside all selected clips for that asset.
 */
export function remapWord(
  word: Word,
  assetId: string,
  segments: OutputSegment[],
): Word | null {
  for (const seg of segments) {
    if (seg.clip.asset !== assetId) continue;
    const { srcIn, srcOut } = seg.clip;

    // Word completely outside this clip
    if (word.end <= srcIn || word.start >= srcOut) continue;

    const clippedStart = Math.max(word.start, srcIn);
    const clippedEnd = Math.min(word.end, srcOut);

    return {
      word: word.word,
      start: seg.outStart + (clippedStart - srcIn),
      end: seg.outStart + (clippedEnd - srcIn),
      probability: word.probability,
    };
  }
  return null;
}

/** Remap all words for all assets into a single sorted output-time word list. */
export function remapAllWords(
  wordsByAsset: Record<string, Word[]>,
  edit: Edit,
): Word[] {
  const segments = buildOutputTimeline(edit);
  const out: Word[] = [];

  for (const [assetId, words] of Object.entries(wordsByAsset)) {
    for (const word of words) {
      const mapped = remapWord(word, assetId, segments);
      if (mapped) out.push(mapped);
    }
  }

  out.sort((a, b) => a.start - b.start || a.end - b.end);
  return out;
}

/** Find which output segment covers a given output time. */
export function segmentAtTime(
  segments: OutputSegment[],
  t: number,
): OutputSegment | null {
  for (const seg of segments) {
    if (t >= seg.outStart && t < seg.outEnd) return seg;
  }
  // Include exact end of last segment
  const last = segments[segments.length - 1];
  if (last && Math.abs(t - last.outEnd) < 1e-6) return last;
  return null;
}
