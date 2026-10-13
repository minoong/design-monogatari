# @repo/vehicle-3d Agent Instructions

Three.js vehicle viewer (BMW X5 G05) as a JIT internal package: no build step, `exports` map straight to `src/`. It is **not** part of the design system (`@repo/ui`) and not a shadcn registry item.

## Where `three` may be imported

`three` and `@react-three/fiber` are **dependencies of this package only**. `@repo/ui`, `apps/web`, and `apps/docs` must not import them directly; they use this package:

| Export                       | What                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `@repo/vehicle-3d/viewer`    | `VehicleCanvas` (studio lighting, shadows, model load/assemble/align/paint, yaw or orbit controls), `useModelAvailable`, `InspectHandle` |
| `@repo/vehicle-3d/vehicles`  | vehicle list, files, `credit` (CC BY 4.0 notice), missing-model hint                                                                     |
| `@repo/vehicle-3d/paints`    | OEM paint chips (`PAINT_SWATCHES`), `usePaintSelection`                                                                                  |
| `@repo/vehicle-3d/constants` | camera, ground, yaw constants                                                                                                            |

`'use client'` everywhere. An app must load the viewer client-only (`next/dynamic` with `ssr: false`) and show a fallback while it loads. **Never put Motion on the WebGL canvas**; animate colour or camera inside three (`useFrame` + `invalidate`) or with GSAP on a non-canvas element. Dispose geometries/materials you replace.

## Assets are not in this package

`VehicleCanvas` fetches `/models/<file>` and `/models/studio.hdr` from the host app. The host decides how they get there:

- Storybook: `pnpm --filter @repo/ui copy:car` downloads the BMW X5 G05 parts (CC BY 4.0, BMW Car IT) and the Poly Haven HDR (CC0) into `packages/ui/.storybook/public/models/` (gitignored). `build-storybook` removes `storybook-static/models/` afterwards (`packages/ui/scripts/prune-storybook-models.mjs`, fails if any 3D asset remains), so meshes and the HDR never ship in a static Storybook.
- An app that ships the model must carry the CC BY 4.0 notice (see below) and decide size/compression (not done yet).

## Model notes

Use only openly licensed models; no EULA-restricted meshes. The CC BY 4.0 notice (creator, source, license, warranty disclaimer, modifications, trademark) lives in `src/vehicles.ts` `credit` and is rendered by the host's credit component (Storybook: `VehicleCredit`) — keep it in sync when the model processing changes; the long form is `packages/ui/.storybook/public/models/README.md`. G05 doors, hood, and seats are half-meshes; `assembleG05Three` mirrors them on Z and hides `*_void` / light-effect nodes. Interior also loads non-color trim and the steering wheel. Dark windshield glass is made transmissive so the cabin is visible. Paint story: GSAP pin + yaw. `X5 원본`: OrbitControls (drag orbit, wheel zoom). Do not copy car meshes from third-party visualizers. Vision M NEXT print data is out of scope.
