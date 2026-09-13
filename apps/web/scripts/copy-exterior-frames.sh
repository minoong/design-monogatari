#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../../.." && pwd)"
src="${1:-$root/downloads/polestar-p417-exterior}"
dest="$root/apps/web/public/exterior/desktop"

if [[ ! -d "$src" ]]; then
  echo "missing source: $src" >&2
  exit 1
fi

mkdir -p "$dest"
shopt -s nullglob
files=("$src"/*.avif)
if ((${#files[@]} == 0)); then
  echo "no .avif files in $src" >&2
  exit 1
fi

cp "${files[@]}" "$dest/"
echo "copied ${#files[@]} frames to $dest"
