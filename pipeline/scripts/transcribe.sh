#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ASSETS="${ROOT}/roman-assets"
OUT="${ROOT}/transcripts"
MODEL="${WHISPER_MODEL:-mlx-community/whisper-large-v3-turbo}"

mkdir -p "$OUT"
export PATH="${HOME}/.local/bin:${PATH}"

shopt -s nullglob
files=("$ASSETS"/*.MOV)
total=${#files[@]}
i=0

for f in "${files[@]}"; do
  i=$((i + 1))
  base="$(basename "$f" .MOV)"
  if [[ -f "${OUT}/${base}.json" ]]; then
    echo "[${i}/${total}] skip ${base} (exists)"
    continue
  fi
  echo "[${i}/${total}] transcribing ${base}..."
  mlx_whisper "$f" \
    --model "$MODEL" \
    --language en \
    --word-timestamps True \
    --output-dir "$OUT" \
    --output-name "$base" \
    --output-format json \
    --verbose False
done

echo "Done. Transcripts in ${OUT}"
