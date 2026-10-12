---
paths:
  - 'packages/ui/**'
---

# @repo/ui internal package

Just-in-Time package: exports TypeScript source, consumed and compiled by apps.

## Exports

- Subpath only: `@repo/ui/button`, `@repo/ui/icons/plus`
- Configured in `package.json` `"exports": { "./icons/*": "./src/icons/*.tsx", "./*": "./src/*.tsx" }`
- No barrel `index.ts`

## Scripts

- `lint`, `check-types` — run via turbo
- New components: `pnpm component:new <name>` at the repo root (see the `create-component` skill); `pnpm components:check` enforces the checklist
- `storybook` / `build-storybook` / `copy:car` — docs and local 3D meshes (gitignored)
- No `build` script (JIT pattern)
- `three` / `@react-three/fiber` are **not** dependencies of `@repo/ui`; the 3D stories use `@repo/vehicle-3d` (devDependency). 3D stories are not a public `@repo/ui/*` export.

## Composition

Patterns live in `packages/ui/AGENTS.md` (Composition patterns). Do not add a separate DS skill.

- Single control + variants: `packages/ui/src/button.tsx` (`cva`, `asChild`)
- Compound widget: `packages/ui/src/dialog.tsx` (`Dialog*` parts + context)
- No render-prop / HOC public API

When adding npm publish later, migrate to Compiled pattern (`tsc` → `dist/**`) and add Changesets.
