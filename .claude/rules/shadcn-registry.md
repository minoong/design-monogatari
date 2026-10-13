---
paths:
  - 'registry/**'
  - 'registry.json'
  - 'packages/ui/**'
---

# shadcn Registry

Distribute components via a [shadcn registry](https://ui.shadcn.com/docs/registry). Monorepo apps use `@repo/ui/*`; external apps use `shadcn add`.

**`packages/ui/src` is the only source.** `registry/design-monogatari/*.tsx` and the `theme` item's `cssVars` / `css` in `registry.json` are **generated** by `pnpm registry:sync` (`scripts/sync-registry.mjs`). Never edit them by hand; `pnpm registry:check` (part of `pnpm verify`) fails on drift.

## When adding a component

1. Implement in `packages/ui/src/<name>.tsx` (monorepo source). Siblings may be imported as `./<other>` only if `<other>` is also a registry item, otherwise the sync fails
2. Add the item to `registry.json` `items` (`name`, `type: registry:ui`, `title`, `description`, npm `dependencies`, `registryDependencies` with `minoong/design-monogatari/cn` and `/theme` when using tokens, and `files: [{ path: registry/design-monogatari/<name>.tsx, type: registry:ui, target: @ui/<name>.tsx }]`)
3. Run `pnpm registry:sync`. It rewrites `./lib/cn` to `@/lib/utils`, `./lib/motion` to `@/lib/motion` (components using motion tokens list the `motion` item in `registryDependencies`), and `./<sibling>` to `@/ui/<sibling>` (the shadcn CLI maps both to the consumer's aliases)
4. New design tokens go in `packages/ui/src/styles/globals.css` only; the sync carries them to the `theme` item
5. Verify in a real consumer (below), then `pnpm verify`
6. **Format/lint**: `registry/` gets Prettier only (not ESLint — `@/lib/utils` paths). Source of truth lint is `packages/ui`

Reference: `packages/ui/src/button.tsx`

The reasons the theme item is shaped this way (palette in `cssVars.light`, `color-mix` → `rgb()`, keyframes via `css`) are documented at the top of `scripts/sync-registry.mjs`; read that before touching the theme generation.

## Consumer requirements

- Tailwind v4 and a **Radix-based** shadcn project: `shadcn init -b radix`. The default `shadcn init -d` is Base UI (`base-nova`), and the CLI rewrites our Radix `asChild` into Base UI `render=`, which breaks Dialog (`render` does not exist on Radix props)
- Files land in the consumer's `ui` alias (`@/components/ui/*`) and `@/lib/utils`

## Consumer-install e2e (CI)

`pnpm registry:consumer-test` (`scripts/test-registry-consumer.mjs`) installs every item into a fresh pinned `create-next-app` project (`shadcn init -b radix`), then `tsc`, `next build`, a compiled-CSS check, and a rendered-page fetch. `--source hosted` (default) tests the PR's own build; `--source github` installs `minoong/design-monogatari/<item>` from the default branch (refs do not follow dependencies, so only after merge and nightly). Workflow: `.github/workflows/registry.yml`. Use `--only a,b --keep` to debug.

## External install

```bash
pnpm dlx shadcn@latest add minoong/design-monogatari/badge        # GitHub registry (public main)
pnpm dlx shadcn@latest add https://<docs-host>/r/badge.json        # hosted registry (once deployed)
```

Validate the registry file: `pnpm exec shadcn registry validate registry.json` (the workflow runs it too).

GitHub addresses (`owner/repo/item`) need a public `github.com` repo with `registry.json` at the root. Pin with `#ref` (branch, tag, SHA), but the ref is **not inherited by `registryDependencies`** — a pinned item still pulls `cn` and `theme` from the default branch. The shadcn registry directory / health monitor do not apply to GitHub addresses.
