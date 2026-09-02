# Agent Instructions

Project-specific notes for **design-monogatari**. Turborepo conventions are covered by the official skill — do not duplicate them here.

## Turborepo (official)

- **Skill**: `.agents/skills/turborepo/` (from `npx skills add vercel/turborepo`)
  - Read `SKILL.md` before changing `turbo.json`, tasks, caching, or monorepo structure.
- **Search docs** (version-matched to installed turbo):

  ```bash
  turbo docs "task descriptions"
  turbo docs "internal packages"
  ```

- **Markdown docs**: append `.md` to any URL, e.g. `https://turborepo.dev/docs/guides/ai.md`
- **Sitemap**: `https://turborepo.dev/sitemap.md`

## This repository

```
apps/web, apps/docs     Next.js apps (ports 3000, 3001)
packages/ui             @repo/ui — JIT internal package (no build script)
packages/*-config       eslint, typescript, prettier shared configs
```

- Package manager: **pnpm** (`workspace:*`)
- `@repo/ui` imports: `@repo/ui/button` (subpath, no barrels)

## Verification (definition of done)

```bash
pnpm verify
```

Equivalent:

```bash
pnpm format:check
turbo run lint check-types build --filter=@repo/ui --filter=web --filter=docs
```

Do not commit or push unless the user asks.

## Scaffolding

```bash
pnpm --filter @repo/ui generate:component
```
