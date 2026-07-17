import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EditSchema,
  TranscriptSchema,
  type Edit,
  type SubtitleChunk,
  type Word,
} from "./schema.js";
import { remapAllWords } from "./remap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function extractWords(transcript: unknown): Word[] {
  const parsed = TranscriptSchema.parse(transcript);
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
      if (seg.words?.length) {
        for (const w of seg.words) {
          words.push({
            word: w.word.trim(),
            start: w.start,
            end: w.end,
            probability: w.probability,
          });
        }
      }
    }
  }

  return words.filter((w) => w.word.length > 0);
}

/**
 * Chunk remapped words into 3–5 word groups for karaoke-style captions.
 * Snap boundaries at natural gaps (>0.35s) when possible.
 */
export function chunkWords(
  words: Word[],
  maxWords = 4,
  gapThreshold = 0.35,
): SubtitleChunk[] {
  if (words.length === 0) return [];

  const chunks: SubtitleChunk[] = [];
  let current: Word[] = [];

  const flush = () => {
    if (current.length === 0) return;
    chunks.push({
      start: current[0]!.start,
      end: current[current.length - 1]!.end,
      words: current.map((w) => ({
        text: w.word.replace(/^[^\w']+|[^\w']+$/g, "") || w.word,
        start: w.start,
        end: w.end,
      })),
    });
    current = [];
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i]!;
    const prev = current[current.length - 1];

    if (prev && w.start - prev.end > gapThreshold) {
      flush();
    }

    current.push(w);

    if (current.length >= maxWords) {
      flush();
    }
  }
  flush();

  // Clean empty/punctuation-only words
  return chunks
    .map((c) => ({
      ...c,
      words: c.words.filter((w) => w.text.length > 0),
    }))
    .filter((c) => c.words.length > 0);
}

export async function loadWordsByAsset(
  edit: Edit,
  transcriptsDir = path.join(ROOT, "transcripts"),
): Promise<Record<string, Word[]>> {
  const files = await readdir(transcriptsDir);
  const byAsset: Record<string, Word[]> = {};

  for (const asset of edit.assets) {
    // Match transcript by asset id or basename of path
    const base = path.basename(asset.path, path.extname(asset.path));
    const candidates = [
      `${asset.id}.json`,
      `${base}.json`,
      `IMG_${asset.id}.json`,
    ];
    const match = files.find((f) => candidates.includes(f));
    if (!match) {
      console.warn(`No transcript for asset ${asset.id} (${base})`);
      continue;
    }
    const raw = JSON.parse(
      await readFile(path.join(transcriptsDir, match), "utf8"),
    );
    byAsset[asset.id] = extractWords(raw);
  }

  return byAsset;
}

export async function buildSubtitles(
  edit: Edit,
  transcriptsDir = path.join(ROOT, "transcripts"),
): Promise<SubtitleChunk[]> {
  const byAsset = await loadWordsByAsset(edit, transcriptsDir);
  const remapped = remapAllWords(byAsset, edit);
  return chunkWords(remapped, edit.subtitleStyle.maxWordsPerChunk);
}

async function main() {
  const editArg = process.argv[2] ?? path.join(ROOT, "edits/roman-v1.json");
  const outArg = process.argv[3] ?? path.join(ROOT, "build/subtitles.json");
  const edit = EditSchema.parse(
    JSON.parse(await readFile(editArg, "utf8")),
  );
  const chunks = await buildSubtitles(edit);
  await mkdir(path.dirname(outArg), { recursive: true });
  await writeFile(outArg, JSON.stringify(chunks, null, 2));
  console.log(`Wrote ${chunks.length} subtitle chunks → ${outArg}`);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
