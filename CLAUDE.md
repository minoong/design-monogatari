# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` (root, `apps/web`, `packages/ui`) holds the agent index and folder notes. Claude Code does not load the root one automatically when this file exists — this file and `.claude/` carry what Claude needs. `apps/web/CLAUDE.md` and `packages/ui/CLAUDE.md` import their folder's `AGENTS.md`.

## Commands

Node 24+, pnpm (Turborepo). No test runner exists; correctness is gated by lint, types, and build.

```bash
pnpm install
pnpm dev                              # all apps (web :3000, docs :3001)
pnpm --filter web dev                 # one app
pnpm --filter @repo/ui storybook      # component docs :6006 (not part of verify)
pnpm --filter @repo/ui copy:car       # Storybook 3D meshes (gitignored, needed for 3D stories)
pnpm --filter web copy:exterior       # exterior frame stills (gitignored public/exterior/)

pnpm format                           # Prettier write (Tailwind class sort included)
pnpm lint                             # ESLint, --max-warnings 0
pnpm check-types                      # web runs `next typegen && tsc --noEmit`
pnpm verify                           # format:check + lint + check-types + build (what CI runs)
pnpm --filter @repo/ui exec eslint src/button.tsx   # lint a single file
pnpm --filter @repo/ui generate:component           # scaffold a new @repo/ui component
```

Pre-commit runs husky + lint-staged (Prettier + ESLint --fix on staged files).

## Architecture

- **`packages/ui` (`@repo/ui`)** is a JIT internal package: no build step, exports map straight to source (`@repo/ui/button` → `src/button.tsx`, `@repo/ui/cn`, `@repo/ui/styles.css`, `@repo/ui/icons/*`). One component per file, **named exports, no barrel `index.ts`**. It is a design system, _not_ FSD — don't slice it. Composition patterns (CVA variants, compound components, `asChild` + Radix `Slot`, no render props) are tabulated in `packages/ui/AGENTS.md`; copy `button.tsx` / `dialog.tsx` rather than inventing new API styles.
- **`apps/web` and `apps/docs`** are Next.js apps using Feature-Sliced Design under `src/` (`_app` for providers/styles/fonts, `_pages/<page>` with `ui/` and `model/`). Next's `app/` directory only re-exports from `src/_app` / `src/_pages`. Each app's Tailwind entry does `@import "@repo/ui/styles.css"` plus `@source` for its own TSX. `apps/web/AGENTS.md` warns this is a newer Next.js than training data — consult `node_modules/next/dist/docs/` before writing Next code.
- **Design tokens** have two sources that must stay in sync: [DESIGN.md](DESIGN.md) (front-matter spec; source of truth) and the `@theme` block in `packages/ui/src/styles/globals.css`. Theme switching is `next-themes` / the Storybook theme toolbar (`.storybook/preview.tsx`) toggling `html.light` / `html.dark`. Read DESIGN.md before any UI change.
- **shadcn registry**: components are mirrored for external consumers. When adding/changing a `@repo/ui` component, also update `registry/design-monogatari/<name>.tsx` (imports `@/lib/utils` instead of `@repo/ui/cn`) and root `registry.json`. `registry/` gets Prettier only, not ESLint.
- **Storybook** stories are co-located (`packages/ui/src/*.stories.tsx`, `src/foundations/*.stories.tsx`); sidebar titles and copy are Korean (파운데이션 / 컴포넌트). 3D car stories live in `packages/ui/src/storybook/scroll-3d/` and are not a public export.

## Claude Code harness (`.claude/`, `.mcp.json`)

- **Rules** `.claude/rules/*.md`: always-on (`agent-loop`, `code-quality`, `git-workflow`, `pnpm-monorepo`, `stack-guardrails`) or `paths`-scoped (`design`, `styling`, `animation`, `fsd-apps`, `ui-a11y`, …).
- **Skills** `.claude/skills/<name>` are symlinks to `.agents/skills/<name>` (the `npx skills add` install root, tracked by `skills-lock.json`). Add new skills under `.agents/skills/` and symlink them; don't copy.
- **Subagent** `ui-verifier` (`.claude/agents/ui-verifier.md`) runs Storybook light/dark checks and `pnpm verify`. The Playwright MCP server is defined inline in that file, so it exists only inside the subagent; `.mcp.json` holds `lucide-animated` for the main session.
- **Hooks** (`.claude/settings.json` → `.claude/hooks/`): `SessionStart` injects DESIGN.md pointers; `ui-verify.mjs` tracks UI edits via `PostToolUse` and blocks `Stop` / `SubagentStop` until Playwright and `pnpm verify` have run (state in gitignored `.claude/hooks/state/`).

## Rules that are easy to violate

- **Motion vs GSAP**: UI motion uses `motion` (import `motion/react-client`). Scroll/pin/scrub uses GSAP + ScrollTrigger (`ScrollImageSequence`, 견적 exterior). Never use both on the same element; never put Motion on a WebGL/canvas element; don't combine Tailwind `transition-*` with Motion on one element; respect `useReducedMotion()`.
- **`three` / `@react-three/fiber` are Storybook-only** devDependencies of `@repo/ui` — never import them from `apps/web` or `apps/docs`.
- **No new dependencies or alternative stack libraries** (styled-components, Vue, npm/yarn, etc.) without explicit user approval.
- `"use client"` only when needed (handlers, hooks, Motion, Radix).
- Dialog: `DialogTitle` is required in `DialogContent`, and `DialogContent` already renders the overlay.

## Workflow

- Work on a feature branch from `main` (`feat/`, `fix/`, `chore/`); never commit directly to `main`. Commit, push, and PR only when the user asks; commit messages are Korean Conventional Commits (`git-commit` skill).
- After UI / token / Storybook changes, verify without being asked: delegate to `ui-verifier`, then run `pnpm verify` (`ship-ui-change` skill).
- If structure, DS API, tokens, or scripts change, update README.md / DESIGN.md / nested AGENTS.md to match (`sync-project-docs` skill).
- Deep how-tos live in skills (turborepo, motion-react, gsap-*, create-component, feature-sliced-design, accessibility, …) — invoke the matching one before the relevant work.
