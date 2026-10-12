---
paths:
  - 'turbo.json'
  - 'pnpm-workspace.yaml'
  - '**/package.json'
---

# Turborepo

For turbo.json, tasks, caching, filters, internal packages, and monorepo structure:

1. Invoke the `turborepo` skill (`.agents/skills/turborepo/SKILL.md`, official Vercel skill)
2. Search docs: `turbo docs "<query>"`
3. Do not invent Turborepo patterns — follow the skill and project `turbo.json` task descriptions

Project-specific layout and verification commands are in `CLAUDE.md` and `AGENTS.md`.

## Task order that matters

`build` depends on `check-types` (per package). Next apps run `next typegen` inside `check-types` and `next build` inside `build`, and both write `.next/types`. In parallel they race and `tsc` fails with `Cannot find module './routes.js'` / `Cannot find name 'LayoutProps'`. Do not drop that dependency to "speed up" CI.
