---
paths:
  - 'packages/vehicle-3d/**'
---

# @repo/vehicle-3d

`three` and `@react-three/fiber` are allowed **only here**. Details: `packages/vehicle-3d/AGENTS.md`.

- `'use client'` in every component file; apps load the viewer with `next/dynamic` (`ssr: false`) and render a fallback.
- No Motion on the WebGL canvas. Animate inside three (`useFrame` + `invalidate`) or with GSAP on a non-canvas element; respect reduced motion.
- No assets in this package. `/models/*` is served by the host app; never commit meshes or HDRs, and never bundle them into a static Storybook (`prune-storybook-models.mjs` enforces that).
- The CC BY 4.0 credit (`src/vehicles.ts` `credit`) must stay in sync with how the model is processed, and the host must show it wherever the model is shown.
- Dispose geometries, materials, and textures you replace. Keep the public API small (`viewer`, `vehicles`, `paints`, `constants`) so the engine stays swappable.
