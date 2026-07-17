# Tokr — JSON edit-list video pipeline

Reusable pipeline for assembling talking-head TikToks from short clips:

1. **Transcribe** clips with word-level timestamps (`mlx-whisper`)
2. **Edit** via a checked-in JSON decision list (`edits/*.json`)
3. **Cut** with ffmpeg (re-encode, loudnorm) → `build/base.mp4`
4. **Subtitles** remapped to output time → karaoke chunks
5. **Compose** in Remotion: base video + fullscreen motion graphics + karaoke captions

## Quick start (Roman telescope video)

```bash
# Already done for roman-v1 — re-run as needed:
npm run transcribe
npm run cut -- edits/roman-v1.json build/base.mp4
npm run subtitles -- edits/roman-v1.json build/subtitles.json
npm run render          # → build/final.mp4
npm run studio          # Remotion preview
```

## Edit JSON (v1)

See [`edits/roman-v1.json`](edits/roman-v1.json). Schema in [`pipeline/src/schema.ts`](pipeline/src/schema.ts).

Key fields:

- `timeline[]` — `{ asset, srcIn, srcOut }` clips in order
- `overlays[]` — `{ generator, start, end, mode }` fullscreen/overlay graphics
- `subtitleStyle` — karaoke colors, font, chunk size

Timeline remapping (source time → output time) lives in [`pipeline/src/remap.ts`](pipeline/src/remap.ts).

## Graphics registry

| Generator | Preview composition |
|-----------|---------------------|
| `TransitMethod` | `TransitMethodPreview` |
| `SpySatellite` | `SpySatellitePreview` |
| `Spectroscopy` | `SpectroscopyPreview` |

Add new generators under `video/src/graphics/` and register them in `registry.tsx`.

## Layout

```
pipeline/     # Node/TS tools (schema, remap, cut, subtitles)
video/        # Remotion project
edits/        # Edit decision lists
transcripts/  # Whisper JSON per clip
roman-assets/ # Source footage
build/        # base.mp4, subtitles.json, final.mp4
```
