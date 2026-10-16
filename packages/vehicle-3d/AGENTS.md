# @repo/vehicle-3d Agent Instructions

Three.js vehicle viewer (BMW X5 G05) as a JIT internal package: no build step, `exports` map straight to `src/`. It is **not** part of the design system (`@repo/ui`) and not a shadcn registry item.

## Where `three` may be imported

`three` and `@react-three/fiber` are **dependencies of this package only**. `@repo/ui`, `apps/web`, and `apps/docs` must not import them directly; they use this package:

| Export                       | What                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@repo/vehicle-3d/viewer`    | `VehicleCanvas` (studio lighting, shadows, model load/assemble/align, optional paint colour, orbit controls: drag to rotate, wheel to zoom; `wheelZoom={false}` for pages that scroll: no wheel/pinch zoom and `touch-action: pan-y`, zoom through the `inspectRef` handle; `onReady` fires once the parts are assembled), `useModelAvailable`, `InspectHandle` |
| `@repo/vehicle-3d/vehicles`  | vehicle list, files, `credit` (CC BY 4.0 notice), missing-model hint                                                                                                                                                                                                                                                                                            |
| `@repo/vehicle-3d/paints`    | OEM paint chips (`PAINT_SWATCHES`), `usePaintSelection`                                                                                                                                                                                                                                                                                                         |
| `@repo/vehicle-3d/constants` | camera, ground constants                                                                                                                                                                                                                                                                                                                                        |

`'use client'` everywhere. An app must load the viewer client-only (`next/dynamic` with `ssr: false`) and show a fallback while it loads. **Never put Motion on the WebGL canvas**; animate colour or camera inside three (`useFrame` + `invalidate`) or with GSAP on a non-canvas element. Dispose geometries/materials you replace.

## Assets are not in this package

`VehicleCanvas` fetches `/models/<file>` and `/models/studio.hdr` from the host app. The host decides how they get there:

- Storybook: `pnpm --filter @repo/ui copy:car` downloads the BMW X5 G05 parts (CC BY 4.0, BMW Car IT) and the Poly Haven HDR (CC0) into `packages/ui/.storybook/public/models/` (gitignored). `build-storybook` removes `storybook-static/models/` afterwards (`packages/ui/scripts/prune-storybook-models.mjs`, fails if any 3D asset remains), so meshes and the HDR never ship in a static Storybook.
- Apps ship the **optimized** model: `apps/web/public/models/g05-web/*.glb` (13 parts, 6.5MB, meshopt-compressed, **no emblem part**) with its `LICENSE.txt`, plus `public/models/studio.hdr` (CC0). Regenerate with `pnpm --filter @repo/vehicle-3d optimize:g05` (reads the `copy:car` originals and writes straight into that folder; Storybook serves the same folder via `staticDirs`, so the `x5-web` stories need no extra step). The vehicle id is `x5-web`; `x5` is the original for Storybook only. Third-party terms live in the root `NOTICE`. Never commit the 40MB originals.
- `VehicleCanvas` loads `.glb` with `GLTFLoader` + `MeshoptDecoder` (inlined in three, no extra files).

## Model notes

Use only openly licensed models; no EULA-restricted meshes. The CC BY 4.0 notice (creator, source, license, warranty disclaimer, modifications, trademark) lives in `src/vehicles.ts` `credit` and is rendered by the host's credit component (Storybook: `VehicleCredit`) — keep it in sync when the model processing changes; the long form is `packages/ui/.storybook/public/models/README.md`. G05 doors, hood, and seats are half-meshes; `assembleG05Three` mirrors them on Z and hides `*_void` / light-effect nodes. Interior also loads non-color trim and the steering wheel. Dark windshield glass is made transmissive so the cabin is visible. Paint skips the wheel parts (`Wheel_Tire/Rim/Screws/Connecter`, `Brake_*`) by mesh name even when their material is named like paint; panels such as wheel arches are still painted. Paint story: GSAP pin + yaw. `X5 원본`: OrbitControls (drag orbit, wheel zoom). Do not copy car meshes from third-party visualizers. Vision M NEXT print data is out of scope.
