import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { TranscriptSchema, type Word } from "./schema.js";

export type ClipTranscript = {
  id: string;
  path: string;
  text: string;
  textNorm: string;
  words: Word[];
  speechStart: number;
  speechEnd: number;
  durationHint: number;
};

function extractWords(raw: unknown): Word[] {
  const parsed = TranscriptSchema.parse(raw);
  const words: Word[] = [];
  if (parsed.words?.length) {
    for (const w of parsed.words) {
      words.push({
        word: w.word.trim(),
        start: w.start,
        end: w.end,
        probability: w.probability,
      });
    }
  } else if (parsed.segments) {
    for (const seg of parsed.segments) {
      for (const w of seg.words ?? []) {
        words.push({
          word: w.word.trim(),
          start: w.start,
          end: w.end,
          probability: w.probability,
        });
      }
    }
  }
  return words.filter((w) => w.word.length > 0);
}

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textIncludes(haystackNorm: string, needle: string): boolean {
  return haystackNorm.includes(normalizeText(needle));
}

export async function loadTranscripts(
  root: string,
  transcriptsDir: string,
  assetsDir: string,
): Promise<ClipTranscript[]> {
  const tDir = path.isAbsolute(transcriptsDir)
    ? transcriptsDir
    : path.join(root, transcriptsDir);
  const aDir = path.isAbsolute(assetsDir)
    ? assetsDir
    : path.join(root, assetsDir);

  const files = (await readdir(tDir))
    .filter((f) => f.endsWith(".json"))
    .sort();

  const clips: ClipTranscript[] = [];
  for (const f of files) {
    const id = f.replace(/\.json$/, "");
    const raw = JSON.parse(await readFile(path.join(tDir, f), "utf8"));
    const words = extractWords(raw);
    const text = String(raw.text ?? "").trim();
    const speechStart = words[0]?.start ?? 0;
    const speechEnd = words[words.length - 1]?.end ?? 0;
    const movPath = path.join(aDir, `${id}.MOV`);
    clips.push({
      id,
      path: path.relative(root, movPath),
      text,
      textNorm: normalizeText(text),
      words,
      speechStart,
      speechEnd,
      durationHint: Math.max(0, speechEnd - speechStart),
    });
  }
  return clips;
}

/** Rough Jaccard similarity on word sets — for near-duplicate detection. */
export function textSimilarity(a: string, b: string): number {
  const aw = new Set(normalizeText(a).split(" ").filter(Boolean));
  const bw = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (aw.size === 0 || bw.size === 0) return 0;
  let inter = 0;
  for (const w of aw) if (bw.has(w)) inter++;
  const union = aw.size + bw.size - inter;
  return inter / union;
}

/** Fluency heuristic: penalize fillers and very short / trailing-off clips. */
export function fluencyScore(clip: ClipTranscript): number {
  const fillers = (clip.textNorm.match(/\b(uh|um|like|you know|i mean)\b/g) ?? [])
    .length;
  const words = clip.words.length;
  const fillerRate = words > 0 ? fillers / words : 1;
  const lengthBonus = Math.min(clip.durationHint / 12, 1.2);
  const endsStrong = /[.!?]$/.test(clip.text.trim()) ? 0.15 : 0;
  return lengthBonus + endsStrong - fillerRate * 2;
}
