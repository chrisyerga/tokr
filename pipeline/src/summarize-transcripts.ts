import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

type Word = { word: string; start: number; end: number };

async function main() {
  const dir = path.join(ROOT, "transcripts");
  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".json"))
    .sort();

  const rows: {
    id: string;
    duration: number;
    text: string;
    words: number;
  }[] = [];

  for (const f of files) {
    const raw = JSON.parse(await readFile(path.join(dir, f), "utf8")) as {
      text: string;
      segments?: { start: number; end: number; words?: Word[] }[];
    };
    const words =
      raw.segments?.flatMap((s) => s.words ?? []) ?? [];
    const end =
      words.length > 0
        ? words[words.length - 1]!.end
        : (raw.segments?.[raw.segments.length - 1]?.end ?? 0);
    rows.push({
      id: f.replace(/\.json$/, ""),
      duration: end,
      text: (raw.text || "").trim(),
      words: words.length,
    });
  }

  const outMd = [
    "# Transcript summary",
    "",
    ...rows.map(
      (r) =>
        `## ${r.id} (${r.duration.toFixed(1)}s, ${r.words} words)\n\n${r.text}\n`,
    ),
  ].join("\n");

  await writeFile(path.join(ROOT, "build/transcript-summary.md"), outMd);
  await writeFile(
    path.join(ROOT, "build/transcript-summary.json"),
    JSON.stringify(rows, null, 2),
  );
  console.log(`Summarized ${rows.length} transcripts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
