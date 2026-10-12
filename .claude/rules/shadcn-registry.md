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
3. Run `pnpm registry:sync`. It rewrites `./lib/cn` to `@/lib/utils` and `./<sibling>` to `@/ui/<sibling>` (the shadcn CLI maps both to the consumer's aliases)
4. New design tokens go in `packages/ui/src/styles/globals.css` only; the sync carries them to the `theme` item
5. Verify in a real consumer (below), then `pnpm verify`
6. **Format/lint**: `registry/` gets Prettier only (not ESLint — `@/lib/utils` paths). Source of truth lint is `packages/ui`

Reference: `packages/ui/src/button.tsx`

## Why the theme item is generated this way

Found by installing into a fresh app, not by reading docs:

- Palette tokens (`--color-neutral-*`, `--color-blue-*`) belong in `cssVars.light`. In `cssVars.theme` the CLI also emits `--color-color-*`
- `color-mix(...)` is not recognised as a colour: the CLI skips `--color-overlay`, so `bg-overlay` (Dialog scrim) is never generated. The sync converts it to `rgb(r g b / n%)`
- `@keyframes` + `--animate-*` must ship in the item, or the Button loading dots do not animate

## Consumer requirements

- Tailwind v4 and a **Radix-based** shadcn project: `shadcn init -b radix`. The default `shadcn init -d` is Base UI (`base-nova`), and the CLI rewrites our Radix `asChild` into Base UI `render=`, which breaks Dialog (`render` does not exist on Radix props)
- Files land in the consumer's `ui` alias (`@/components/ui/*`) and `@/lib/utils`

## Building and testing the hosted registry

```bash
SITE_URL=http://localhost:4102 pnpm --filter docs registry:build   # -> apps/docs/public/r/*.json (gitignored)
cd apps/docs/public && python3 -m http.server 4102                 # serve it
# in a Radix-initialised Next app
pnpm dlx shadcn@latest add http://localhost:4102/r/button.json
```

`scripts/build-registry.mjs` rewrites `registryDependencies` from `minoong/design-monogatari/<name>` to `${SITE_URL}/r/<name>.json` in a temporary copy only; the committed `registry.json` keeps the GitHub ids so GitHub installs still work. Check in the consumer: `tsc`, `next build`, and that utilities such as `.bg-overlay` and `.animate-button-loader-dot` exist in the compiled CSS.

## Consumer-install e2e (CI)

`pnpm verify` only proves the components work inside the monorepo. `scripts/test-registry-consumer.mjs` (`pnpm registry:consumer-test`) installs every item into a fresh `create-next-app` project (pinned version), `shadcn init -b radix`, then `shadcn add` for all 11 items, `tsc`, `next build`, asserts `.bg-overlay` / `@keyframes button-loader-dot` exist in the compiled CSS, and fetches the rendered page.

- `--source hosted` (default): builds the registry, serves `apps/docs/public/r` locally, installs from there. Verifies the PR's own changes.
- `--source github`: installs `minoong/design-monogatari/<item>` from GitHub's default branch — what real users do. Dependency refs do **not** follow `#ref`, so a PR branch cannot be tested this way; it runs after merge and nightly.
- `--only a,b --keep` for debugging (keeps the temp app).

`.github/workflows/registry.yml`: `hosted` job on PRs/pushes touching `registry*`, `packages/ui/src`, or the scripts, plus nightly; `github` job on push to `main`, nightly, and manual dispatch. Kept out of `ci.yml` (minutes of network). Locally it takes ~1–2 min once the pnpm cache is warm.

## External install

```bash
pnpm dlx shadcn@latest add minoong/design-monogatari/badge        # GitHub registry (public main)
pnpm dlx shadcn@latest add https://<docs-host>/r/badge.json        # hosted registry (once deployed)
```

Validate the registry file: `pnpm exec shadcn registry validate registry.json` (the workflow runs it too).

GitHub addresses (`owner/repo/item`) need a public `github.com` repo with `registry.json` at the root. Pin with `#ref` (branch, tag, SHA), but the ref is **not inherited by `registryDependencies`** — a pinned item still pulls `cn` and `theme` from the default branch. The shadcn registry directory / health monitor do not apply to GitHub addresses.
