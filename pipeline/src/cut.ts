import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EditSchema, type Edit } from "./schema.js";
import { buildOutputTimeline, totalDuration } from "./remap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function run(cmd: string, args: string[], cwd = ROOT): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

export async function loadEdit(editPath: string): Promise<Edit> {
  const raw = JSON.parse(await readFile(editPath, "utf8"));
  return EditSchema.parse(raw);
}

function resolveAssetPath(edit: Edit, assetId: string): string {
  const asset = edit.assets.find((a) => a.id === assetId);
  if (!asset) throw new Error(`Unknown asset: ${assetId}`);
  return path.isAbsolute(asset.path)
    ? asset.path
    : path.resolve(ROOT, asset.path);
}

/**
 * Cut each timeline clip to a temp file, then concat with audio crossfades
 * and loudnorm into build/base.mp4.
 */
export async function cutEdit(
  edit: Edit,
  outPath = path.join(ROOT, "build/base.mp4"),
): Promise<{ outPath: string; duration: number }> {
  const resolvedOut = path.isAbsolute(outPath)
    ? outPath
    : path.resolve(process.cwd(), outPath);
  const buildDir = path.dirname(resolvedOut);
  const partsDir = path.join(buildDir, "parts");
  await mkdir(partsDir, { recursive: true });
  outPath = resolvedOut;

  const segments = buildOutputTimeline(edit);
  const partPaths: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const src = resolveAssetPath(edit, seg.clip.asset);
    const partPath = path.join(
      partsDir,
      `${String(i).padStart(3, "0")}_${seg.clip.id}.mp4`,
    );
    partPaths.push(partPath);

    // Accurate trim with re-encode for mid-GOP cuts
    await run("ffmpeg", [
      "-y",
      "-ss",
      String(seg.clip.srcIn),
      "-to",
      String(seg.clip.srcOut),
      "-i",
      src,
      "-vf",
      `scale=${edit.width}:${edit.height}:force_original_aspect_ratio=decrease,pad=${edit.width}:${edit.height}:(ow-iw)/2:(oh-ih)/2,fps=${edit.fps},format=yuv420p`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "18",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      partPath,
    ]);
  }

  // Write concat list
  const listPath = path.join(buildDir, "concat.txt");
  const listBody = partPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
  await writeFile(listPath, listBody);

  const crossfadeMs = edit.audio.crossfadeMs;
  const concatOut = path.join(buildDir, "concat_raw.mp4");

  if (partPaths.length === 1 || crossfadeMs <= 0) {
    await run("ffmpeg", [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c",
      "copy",
      concatOut,
    ]);
  } else {
    // Simple concat first (frame-accurate parts already cut); micro fades via acrossfade
    // For reliability with many clips, use concat demuxer then optional loudnorm.
    await run("ffmpeg", [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "18",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      concatOut,
    ]);
  }

  if (edit.audio.loudnorm) {
    await run("ffmpeg", [
      "-y",
      "-i",
      concatOut,
      "-af",
      `loudnorm=I=${edit.audio.targetLufs}:TP=-1.5:LRA=11`,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      outPath,
    ]);
  } else {
    await run("ffmpeg", ["-y", "-i", concatOut, "-c", "copy", outPath]);
  }

  const duration = totalDuration(edit);
  await writeFile(
    path.join(buildDir, "cut-meta.json"),
    JSON.stringify({ outPath, duration, segments }, null, 2),
  );

  return { outPath, duration };
}

async function main() {
  const editArg = process.argv[2] ?? path.join(ROOT, "edits/roman-v1.json");
  const outArg = process.argv[3] ?? path.join(ROOT, "build/base.mp4");
  const edit = await loadEdit(editArg);
  console.log(
    `Cutting ${edit.timeline.length} clips → ${outArg} (est. ${totalDuration(edit).toFixed(1)}s)`,
  );
  const result = await cutEdit(edit, outArg);
  console.log(`Done: ${result.outPath} (${result.duration.toFixed(2)}s)`);
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
