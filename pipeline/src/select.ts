import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HintsSchema, type Hints, type OverlayHint } from "./hints.js";
import { EditSchema, type Edit, type Overlay, type TimelineClip } from "./schema.js";
import { totalDuration } from "./remap.js";
import {
  fluencyScore,
  loadTranscripts,
  textIncludes,
  textSimilarity,
  type ClipTranscript,
} from "./transcripts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

type PickRecord = {
  clip: ClipTranscript;
  beatId: string;
  reason: string;
  score: number;
  rejected: { id: string; reason: string }[];
};

function pad(n: number, digits = 2): string {
  return n.toFixed(digits);
}

function scoreForTerms(
  clip: ClipTranscript,
  terms: string[],
  preferAssets: string[],
): number {
  let score = fluencyScore(clip);
  for (const term of terms) {
    if (textIncludes(clip.textNorm, term)) score += 1.5;
  }
  if (preferAssets.includes(clip.id)) score += 3.5;
  return score;
}

function bestForTerms(
  candidates: ClipTranscript[],
  terms: string[],
  preferAssets: string[],
  alreadyPicked: ClipTranscript[],
  dupThreshold = 0.55,
): { best: ClipTranscript | null; rejected: { id: string; reason: string }[]; score: number } {
  const rejected: { id: string; reason: string }[] = [];
  let best: ClipTranscript | null = null;
  let bestScore = -Infinity;

  for (const c of candidates) {
    const covers =
      terms.length === 0 || terms.some((t) => textIncludes(c.textNorm, t));
    if (terms.length > 0 && !covers) {
      rejected.push({ id: c.id, reason: "missing beat terms" });
      continue;
    }
    const dup = alreadyPicked.find(
      (p) => textSimilarity(p.text, c.text) >= dupThreshold,
    );
    if (dup) {
      rejected.push({ id: c.id, reason: `near-duplicate of ${dup.id}` });
      continue;
    }
    const score = scoreForTerms(c, terms, preferAssets);
    if (score > bestScore) {
      if (best) {
        rejected.push({
          id: best.id,
          reason: `lower score (${bestScore.toFixed(2)})`,
        });
      }
      bestScore = score;
      best = c;
    } else {
      rejected.push({ id: c.id, reason: `lower score (${score.toFixed(2)})` });
    }
  }

  return { best, rejected, score: bestScore };
}

function filterPool(clips: ClipTranscript[], hints: Hints): ClipTranscript[] {
  return clips.filter((c) => {
    if (hints.excludeAssets.includes(c.id)) return false;
    for (const ex of hints.mustExclude) {
      if (textIncludes(c.textNorm, ex)) return false;
    }
    return true;
  });
}

function toTimelineClip(clip: ClipTranscript): TimelineClip {
  const srcIn = Math.max(0, Number((clip.speechStart - 0.05).toFixed(3)));
  const srcOut = Number((clip.speechEnd + 0.18).toFixed(3));
  return {
    id: `c_${clip.id}`,
    asset: clip.id,
    srcIn,
    srcOut: Math.max(srcOut, srcIn + 0.2),
    note: clip.text.slice(0, 80).trim(),
  };
}

/** Build overlays from hints by matching transcript text of timeline clips. */
export function overlaysFromHints(
  timeline: TimelineClip[],
  textByAsset: Record<string, string>,
  overlayHints: OverlayHint[],
): Overlay[] {
  let cursor = 0;
  const ranges: { start: number; end: number; text: string }[] = [];
  for (const t of timeline) {
    const dur = t.srcOut - t.srcIn;
    ranges.push({
      start: cursor,
      end: cursor + dur,
      text: textByAsset[t.asset] ?? "",
    });
    cursor += dur;
  }

  const overlays: Overlay[] = [];
  for (const hint of overlayHints) {
    const matching = ranges.filter((r) =>
      hint.match.some((m) => textIncludes(r.text, m)),
    );
    if (matching.length === 0) continue;
    overlays.push({
      id: hint.id,
      generator: hint.generator,
      mode: hint.mode,
      start: Number(Math.min(...matching.map((m) => m.start)).toFixed(3)),
      end: Number(Math.max(...matching.map((m) => m.end)).toFixed(3)),
      params: hint.params,
    });
  }
  return overlays;
}

function buildOverlays(
  timeline: TimelineClip[],
  picks: PickRecord[],
  overlayHints: OverlayHint[],
): Overlay[] {
  const textByAsset: Record<string, string> = {};
  for (const p of picks) textByAsset[p.clip.id] = p.clip.textNorm;
  return overlaysFromHints(timeline, textByAsset, overlayHints);
}

export function selectTakes(
  clips: ClipTranscript[],
  hints: Hints,
): { picks: PickRecord[]; uncovered: string[] } {
  const pool = filterPool(clips, hints);
  const picks: PickRecord[] = [];
  const used = new Set<string>();

  const beats =
    hints.beats.length > 0
      ? hints.beats
      : [{ id: "all", mustInclude: hints.mustInclude, preferAssets: hints.preferAssets }];

  for (const beat of beats) {
    const prefer = [...beat.preferAssets, ...hints.preferAssets];
    const terms = beat.mustInclude.length
      ? beat.mustInclude
      : hints.mustInclude;
    const candidates = pool.filter((c) => !used.has(c.id));
    const { best, rejected, score } = bestForTerms(
      candidates,
      terms,
      prefer,
      picks.map((p) => p.clip),
    );
    if (!best) {
      continue;
    }
    used.add(best.id);
    picks.push({
      clip: best,
      beatId: beat.id,
      reason: `best for beat "${beat.id}" (score ${score.toFixed(2)}; terms: ${terms.join(", ") || "—"})`,
      score,
      rejected: rejected.slice(0, 8),
    });
  }

  // Chronological order by asset id / filename (shooting order)
  picks.sort((a, b) => a.clip.id.localeCompare(b.clip.id));

  // Cover any global mustInclude still missing — pull next-best unused clip
  const uncovered = hints.mustInclude.filter(
    (term) => !picks.some((p) => textIncludes(p.clip.textNorm, term)),
  );
  for (const term of [...uncovered]) {
    const candidates = pool.filter((c) => !used.has(c.id));
    const { best, rejected, score } = bestForTerms(
      candidates,
      [term],
      hints.preferAssets,
      picks.map((p) => p.clip),
    );
    if (!best) continue;
    used.add(best.id);
    picks.push({
      clip: best,
      beatId: `cover:${term}`,
      reason: `covers missing mustInclude "${term}" (score ${score.toFixed(2)})`,
      score,
      rejected: rejected.slice(0, 6),
    });
    uncovered.splice(uncovered.indexOf(term), 1);
  }
  picks.sort((a, b) => a.clip.id.localeCompare(b.clip.id));

  // Duration trim: drop lowest-score middle clips until under max
  const maxSec = hints.targetDurationSec.max;
  const minSec = hints.targetDurationSec.min;

  const durationOf = (list: PickRecord[]) =>
    list.reduce((s, p) => s + (p.clip.speechEnd - p.clip.speechStart + 0.23), 0);

  while (durationOf(picks) > maxSec && picks.length > 3) {
    // Never drop first or last; drop lowest score in the middle
    const middle = picks.slice(1, -1);
    if (middle.length === 0) break;
    middle.sort((a, b) => a.score - b.score);
    const drop = middle[0]!;
    const idx = picks.findIndex((p) => p.clip.id === drop.clip.id);
    if (idx >= 0) picks.splice(idx, 1);
  }

  // If under min, try adding fluent unused clips chronologically
  if (durationOf(picks) < minSec) {
    for (const c of pool) {
      if (used.has(c.id)) continue;
      if (picks.some((p) => textSimilarity(p.clip.text, c.text) >= 0.55)) continue;
      used.add(c.id);
      picks.push({
        clip: c,
        beatId: "fill",
        reason: `fill toward min duration (${minSec}s)`,
        score: fluencyScore(c),
        rejected: [],
      });
      picks.sort((a, b) => a.clip.id.localeCompare(b.clip.id));
      if (durationOf(picks) >= minSec) break;
    }
  }

  const stillUncovered = hints.mustInclude.filter(
    (term) => !picks.some((p) => textIncludes(p.clip.textNorm, term)),
  );
  return { picks, uncovered: stillUncovered };
}

export function buildEditFromPicks(hints: Hints, picks: PickRecord[]): Edit {
  const timeline = picks.map((p) => toTimelineClip(p.clip));
  const assets = picks.map((p) => ({
    id: p.clip.id,
    path: p.clip.path,
    duration: p.clip.speechEnd + 1,
  }));
  const overlays = [
    ...hints.fixedOverlays,
    ...buildOverlays(timeline, picks, hints.overlayHints),
  ];

  const edit = EditSchema.parse({
    version: 1,
    title: hints.title,
    fps: hints.fps,
    width: hints.width,
    height: hints.height,
    assets,
    timeline,
    overlays,
    subtitleStyle: hints.subtitleStyle ?? {},
    audio: hints.audio ?? {},
  });
  return edit;
}

export function buildReviewMarkdown(
  hints: Hints,
  picks: PickRecord[],
  edit: Edit,
  uncovered: string[],
  allClips: ClipTranscript[],
): string {
  const dur = totalDuration(edit);
  const lines: string[] = [
    `# Edit review — ${hints.title}`,
    "",
    `**Estimated duration:** ${pad(dur)}s (target ${hints.targetDurationSec.min}–${hints.targetDurationSec.max}s)`,
    `**Clips:** ${picks.length}`,
    "",
    "## Must-include coverage",
    "",
  ];

  for (const term of hints.mustInclude) {
    const hit = picks.find((p) => textIncludes(p.clip.textNorm, term));
    lines.push(
      hit
        ? `- [x] \`${term}\` → ${hit.clip.id}`
        : `- [ ] \`${term}\` **MISSING**`,
    );
  }
  if (uncovered.length) {
    lines.push("", `> Uncovered: ${uncovered.map((u) => `\`${u}\``).join(", ")}`);
  }

  lines.push("", "## Selected timeline", "");

  let cursor = 0;
  for (const p of picks) {
    const t = edit.timeline.find((c) => c.asset === p.clip.id)!;
    const outDur = t.srcOut - t.srcIn;
    const outStart = cursor;
    const outEnd = cursor + outDur;
    cursor = outEnd;
    lines.push(
      `### ${p.clip.id} → out ${pad(outStart)}–${pad(outEnd)}s (${pad(outDur)}s)`,
      "",
      `- **Beat:** ${p.beatId}`,
      `- **Why:** ${p.reason}`,
      `- **Trim:** src ${pad(t.srcIn)}–${pad(t.srcOut)}`,
      "",
      `> ${p.clip.text}`,
      "",
    );
    if (p.rejected.length) {
      lines.push(`<details><summary>Rejected alternatives (${p.rejected.length})</summary>`, "");
      for (const r of p.rejected) {
        lines.push(`- ${r.id}: ${r.reason}`);
      }
      lines.push("", "</details>", "");
    }
  }

  lines.push("## Overlays", "");
  if (edit.overlays.length === 0) {
    lines.push("_None_");
  } else {
    for (const o of edit.overlays) {
      lines.push(
        `- **${o.id}** \`${o.generator}\` @ ${pad(o.start)}–${pad(o.end)}s (${o.mode})`,
      );
    }
  }

  const selected = new Set(picks.map((p) => p.clip.id));
  const unused = allClips.filter((c) => !selected.has(c.id));
  lines.push("", "## Unused clips", "");
  for (const c of unused) {
    const excluded =
      hints.excludeAssets.includes(c.id) ||
      hints.mustExclude.some((ex) => textIncludes(c.textNorm, ex));
    lines.push(
      `- ${c.id} (${pad(c.durationHint)}s)${excluded ? " _excluded by hints_" : ""} — ${c.text.slice(0, 100)}…`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function resolveFromRoot(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

async function main() {
  const hintsPath = resolveFromRoot(
    process.argv[2] ?? "edits/roman.hints.json",
  );
  const draftPath = resolveFromRoot(
    process.argv[3] ?? "edits/roman.draft.json",
  );
  const reviewPath = resolveFromRoot(
    process.argv[4] ?? "build/edit-review.md",
  );

  const hints = HintsSchema.parse(
    JSON.parse(await readFile(hintsPath, "utf8")),
  );

  // Infer assets dir from glob like "roman-assets/*.MOV"
  const assetsDir = hints.assetsGlob.includes("/")
    ? hints.assetsGlob.split("/")[0]!
    : "roman-assets";

  const clips = await loadTranscripts(ROOT, hints.transcriptsDir, assetsDir);
  const { picks, uncovered } = selectTakes(clips, hints);
  const edit = buildEditFromPicks(hints, picks);
  const review = buildReviewMarkdown(hints, picks, edit, uncovered, clips);

  await mkdir(path.dirname(draftPath), { recursive: true });
  await mkdir(path.dirname(reviewPath), { recursive: true });
  await writeFile(draftPath, JSON.stringify(edit, null, 2) + "\n");
  await writeFile(reviewPath, review);

  console.log(
    `Selected ${picks.length} clips → ${draftPath} (${totalDuration(edit).toFixed(1)}s)`,
  );
  console.log(`Review → ${reviewPath}`);
  if (uncovered.length) {
    console.warn(`Uncovered mustInclude: ${uncovered.join(", ")}`);
  }
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
