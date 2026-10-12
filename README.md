# design-monogatari

Turborepo monorepo for the **design-monogatari** design system and demo apps.

## Packages & apps

| Name                      | Path                         | Role                                                                 |
| ------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `web`                     | `apps/web`                   | Next.js demo (port 3000). FSD in `src/`; Next `app/` re-exports only |
| `docs`                    | `apps/docs`                  | 디자인 시스템 문서 사이트 (port 3001). Fumadocs, `content/docs/` MDX |
| `@repo/ui`                | `packages/ui`                | React design system (JIT, Tailwind v4) — not FSD slices              |
| `@repo/vehicle-3d`        | `packages/vehicle-3d`        | Three.js vehicle viewer (JIT). The only package that imports `three` |
| `@repo/eslint-config`     | `packages/eslint-config`     | Shared ESLint flat config                                            |
| `@repo/prettier-config`   | `packages/prettier-config`   | Shared Prettier config                                               |
| `@repo/typescript-config` | `packages/typescript-config` | Shared tsconfig                                                      |

## Develop

Node **24+** (see `.nvmrc`). With nvm: `nvm use`.

```bash
pnpm install
pnpm dev              # all apps
pnpm --filter web dev # single app
pnpm --filter web copy:exterior      # 견적 외장 프레임 (gitignored)
pnpm --filter @repo/ui storybook     # port 6006
pnpm --filter @repo/ui copy:car      # Storybook 3D meshes (gitignored)
```

`apps/web` and `apps/docs` follow Feature-Sliced Design in `src/_app` (providers, styles) and `src/_pages`. Next.js `app/` only re-exports those modules. `@repo/ui` stays a design system package — do not slice it. Details: [AGENTS.md](AGENTS.md), `.claude/rules/fsd-apps.md`.

## Code quality

```bash
pnpm format           # Prettier write (+ Tailwind class sort)
pnpm format:check     # Prettier check
pnpm lint             # ESLint (per package)
pnpm verify           # format + lint + types + build
pnpm --filter @repo/ui storybook   # component docs (port 6006, Light/Dark themes)
```

- **pre-commit**: husky + lint-staged (staged Prettier + ESLint fix)
- **CI**: GitHub Actions runs `pnpm verify` on push/PR to `main`
- Agent docs: [AGENTS.md](AGENTS.md), visual spec [DESIGN.md](DESIGN.md), rule `.claude/rules/code-quality.md`

## Build

```bash
pnpm build
pnpm --filter web build
```

## Registry (external apps)

```bash
pnpm dlx shadcn@latest add minoong/design-monogatari/badge
```

Requirements: Tailwind v4 and a **Radix-based** shadcn project (`shadcn init -b radix`). The default `shadcn init -d` is Base UI, where the CLI rewrites Radix `asChild` to `render=` and breaks `Dialog`.

`packages/ui` is the single source. `pnpm registry:sync` generates `registry/design-monogatari/*` and the `theme` item in [registry.json](registry.json); `pnpm registry:check` (part of `pnpm verify`) fails on drift. `pnpm --filter docs registry:build` writes the hosted form to `apps/docs/public/r/` (set `SITE_URL`). `pnpm registry:consumer-test` installs every item into a fresh Next app and builds it (CI: `.github/workflows/registry.yml`). Details: `.claude/rules/shadcn-registry.md`.

## Links

- [Turborepo docs](https://turborepo.dev/docs)
- [Agent instructions](AGENTS.md)
