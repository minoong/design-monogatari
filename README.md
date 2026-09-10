# design-monogatari

Turborepo monorepo for the **design-monogatari** design system and demo apps.

## Packages & apps

| Name                      | Path                         | Role                                   |
| ------------------------- | ---------------------------- | -------------------------------------- |
| `web`                     | `apps/web`                   | Next.js demo (port 3000)               |
| `docs`                    | `apps/docs`                  | Next.js docs (port 3001)               |
| `@repo/ui`                | `packages/ui`                | React design system (JIT, Tailwind v4) |
| `@repo/eslint-config`     | `packages/eslint-config`     | Shared ESLint flat config              |
| `@repo/prettier-config`   | `packages/prettier-config`   | Shared Prettier config                 |
| `@repo/typescript-config` | `packages/typescript-config` | Shared tsconfig                        |

## Develop

Node **24+** (see `.nvmrc`). With nvm: `nvm use`.

```bash
pnpm install
pnpm dev              # all apps
pnpm --filter web dev # single app
```

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
- Agent docs: [AGENTS.md](AGENTS.md), visual spec [DESIGN.md](DESIGN.md), rule `.cursor/rules/code-quality.mdc`

## Build

```bash
pnpm build
pnpm --filter web build
```

## Registry (external apps)

```bash
pnpm dlx shadcn@latest add minoong/design-monogatari/badge
```

See [registry.json](registry.json) and `.cursor/rules/shadcn-registry.mdc`.

## Links

- [Turborepo docs](https://turborepo.dev/docs)
- [Agent instructions](AGENTS.md)
