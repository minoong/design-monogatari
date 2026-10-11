#!/usr/bin/env bash
set -euo pipefail

dest="$(cd "$(dirname "$0")/.." && pwd)/.storybook/public/models"
mkdir -p "$dest/g05"

# Poly Haven studio_small_08 1k HDR (CC0).
hdr_url="${1:-https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr}"
if [[ -f "$dest/studio.hdr" ]]; then
  echo "skip $dest/studio.hdr"
else
  curl -fsSL "$hdr_url" -o "$dest/studio.hdr"
  echo "saved $dest/studio.hdr"
fi

# BMW X5 G05 (2018), BMW Car IT, CC BY 4.0. Split glTF parts from the official zip.
# Trademark rights are not included in the Creative Commons grant.
g05_url="${2:-https://github.com/bmwcarit/digital-car-3d/releases/download/v1.0.0/G05.zip}"
g05_parts=(
  LICENSE.txt
  meshes/Exterior/O_G05_Exterior_Paint.gltf
  meshes/Exterior/O_G05_Exterior_non-Paint.gltf
  meshes/Exterior/O_G05_Hood.gltf
  meshes/Exterior/O_G05_Headlights.gltf
  meshes/Exterior/O_G05_Taillights.gltf
  meshes/Doors/O_G05_Doors_F.gltf
  meshes/Doors/O_G05_Doors_B.gltf
  meshes/Doors/O_G05_Tailgate.gltf
  meshes/Wheels/O_G05_Wheels.gltf
  meshes/Emblem/O_G05_Emblem.gltf
  meshes/Interior/O_G05_Interior_Color.gltf
  meshes/Interior/O_G05_Interior_non-Color.gltf
  meshes/Interior/O_G05_Seats.gltf
  meshes/Interior/O_G05_SteeringWheel.gltf
)
g05_missing=()
for part in "${g05_parts[@]}"; do
  if [[ ! -f "$dest/g05/$(basename "$part")" ]]; then
    g05_missing+=("$part")
  fi
done
if [[ ${#g05_missing[@]} -eq 0 ]]; then
  echo "skip $dest/g05"
else
  g05_zip="$(mktemp)"
  curl -fsSL -L "$g05_url" -o "$g05_zip"
  unzip -qo -j "$g05_zip" "${g05_missing[@]}" -d "$dest/g05"
  rm -f "$g05_zip"
  echo "saved $dest/g05 (${#g05_missing[@]} files)"
fi
