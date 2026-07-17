import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HintsSchema, PatchSchema, type Patch } from "./hints.js";
import { EditSchema, type Edit, type TimelineClip } from "./schema.js";
import { totalDuration } from "./remap.js";
import { overlaysFromHints } from "./select.js";
import { loadTranscripts, normalizeText } from "./transcripts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

async function clipFromAsset(
  assetId: string,
  srcIn?: number,
  srcOut?: number,
  note?: string,
): Promise<TimelineClip> {
  const clips = await loadTranscripts(ROOT, "transcripts", "roman-assets");
  const clip = clips.find((c) => c.id === assetId);
  if (!clip) throw new Error(`Unknown asset for insert/replace: ${assetId}`);
  const inT =
    srcIn ?? Math.max(0, Number((clip.speechStart - 0.05).toFixed(3)));
  const outT = srcOut ?? Number((clip.speechEnd + 0.18).toFixed(3));
  return {
    id: `c_${assetId}`,
    asset: assetId,
    srcIn: inT,
    srcOut: Math.max(outT, inT + 0.2),
    note: note ?? clip.text.slice(0, 80).trim(),
  };
}

/**
 * Apply a patch onto a draft edit. Returns a new locked edit.
 * When the timeline shape changes, overlays are re-derived from hints.
 */
export async function applyPatch(edit: Edit, patch: Patch): Promise<Edit> {
  let timeline = [...edit.timeline];
  const assets = [...edit.assets];
  let structureChanged = false;

  if (patch.remove.length) {
    timeline = timeline.filter((c) => !patch.remove.includes(c.id));
    structureChanged = true;
  }

  for (const r of patch.replace) {
    const idx = timeline.findIndex((c) => c.id === r.clipId);
    if (idx < 0) throw new Error(`replace: unknown clipId ${r.clipId}`);
    const next = await clipFromAsset(r.withAsset);
    next.id = r.clipId;
    timeline[idx] = next;
    if (!assets.some((a) => a.id === r.withAsset)) {
      assets.push({ id: r.withAsset, path: `roman-assets/${r.withAsset}.MOV` });
    }
    structureChanged = true;
  }

  for (const t of patch.trim) {
    const clip = timeline.find((c) => c.id === t.clipId);
    if (!clip) throw new Error(`trim: unknown clipId ${t.clipId}`);
    if (t.srcIn !== undefined) clip.srcIn = t.srcIn;
    if (t.srcOut !== undefined) clip.srcOut = t.srcOut;
    if (clip.srcOut <= clip.srcIn) {
      throw new Error(`trim: ${t.clipId} srcOut must be > srcIn`);
    }
    structureChanged = true;
  }

  for (const ins of patch.insert) {
    const next = await clipFromAsset(
      ins.asset,
      ins.srcIn,
      ins.srcOut,
      ins.note,
    );
    if (ins.afterClipId === null) {
      timeline.unshift(next);
    } else {
      const idx = timeline.findIndex((c) => c.id === ins.afterClipId);
      if (idx < 0) {
        throw new Error(`insert: unknown afterClipId ${ins.afterClipId}`);
      }
      timeline.splice(idx + 1, 0, next);
    }
    if (!assets.some((a) => a.id === ins.asset)) {
      assets.push({ id: ins.asset, path: `roman-assets/${ins.asset}.MOV` });
    }
    structureChanged = true;
  }

  if (patch.order?.length) {
    const byId = new Map(timeline.map((c) => [c.id, c]));
    const ordered: TimelineClip[] = [];
    for (const id of patch.order) {
      const c = byId.get(id);
      if (!c) throw new Error(`order: unknown clipId ${id}`);
      ordered.push(c);
      byId.delete(id);
    }
    ordered.push(...byId.values());
    timeline = ordered;
    structureChanged = true;
  }

  const used = new Set(timeline.map((c) => c.asset));
  const prunedAssets = assets.filter((a) => used.has(a.id));

  let overlays = edit.overlays;
  if (structureChanged) {
    overlays = [];
    try {
      const hints = HintsSchema.parse(
        JSON.parse(
          await readFile(path.join(ROOT, "edits/roman.hints.json"), "utf8"),
        ),
      );
      const clips = await loadTranscripts(ROOT, "transcripts", "roman-assets");
      const textByAsset: Record<string, string> = {};
      for (const t of timeline) {
        const c = clips.find((x) => x.id === t.asset);
        textByAsset[t.asset] = c?.textNorm ?? normalizeText(t.note ?? "");
      }
      overlays = overlaysFromHints(timeline, textByAsset, hints.overlayHints);
    } catch {
      overlays = [];
    }
  }

  return EditSchema.parse({
    ...edit,
    assets: prunedAssets,
    timeline,
    overlays,
  });
}

function resolveFromRoot(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

async function main() {
  const draftPath = resolveFromRoot(
    process.argv[2] ?? "edits/roman.draft.json",
  );
  const patchPath = resolveFromRoot(
    process.argv[3] ?? "edits/roman.patch.json",
  );
  const outPath = resolveFromRoot(process.argv[4] ?? "edits/roman-v1.json");

  const edit = EditSchema.parse(
    JSON.parse(await readFile(draftPath, "utf8")),
  );

  let patch: Patch = {
    version: 1,
    remove: [],
    replace: [],
    trim: [],
    insert: [],
  };
  try {
    patch = PatchSchema.parse(JSON.parse(await readFile(patchPath, "utf8")));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`No patch at ${patchPath}; locking draft as-is.`);
    } else {
      throw err;
    }
  }

  const locked = await applyPatch(edit, patch);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(locked, null, 2) + "\n");
  console.log(
    `Locked edit → ${outPath} (${locked.timeline.length} clips, ${totalDuration(locked).toFixed(1)}s)`,
  );
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
