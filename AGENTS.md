# Agent Instructions

Project-specific notes for **design-monogatari**. Deep knowledge lives in `.agents/skills/` — do not duplicate in rules.

## Default stack

| Layer             | Choice                                         | Status                     |
| ----------------- | ---------------------------------------------- | -------------------------- |
| Node              | 24+ (`.nvmrc`)                                 | active                     |
| Monorepo          | Turborepo + pnpm                               | active                     |
| React             | 19                                             | active                     |
| Design system     | `@repo/ui` (JIT)                               | active                     |
| Styling           | Tailwind CSS v4                                | active                     |
| UI motion         | Framer Motion                                  | active                     |
| Scroll animation  | GSAP + ScrollTrigger                           | planned (skills installed) |
| Docs              | Storybook (`@repo/ui`)                         | active                     |
| ESLint / Prettier | `@repo/eslint-config`, `@repo/prettier-config` | active                     |

Alternative libraries require **AskQuestion** + user approval (see `.cursor/rules/stack-guardrails.mdc`).

## Cursor context ([docs](https://cursor.com/docs/context/rules))

| Layer         | Location                       | Role                                                                                                   |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| AGENTS.md     | repo root + packages           | Short index — nested files win in that folder ([docs](https://cursor.com/docs/context/rules#agentsmd)) |
| Project Rules | `.cursor/rules/*.mdc`          | `alwaysApply` / `globs` / intelligent `description`                                                    |
| Agent loop    | `.cursor/rules/agent-loop.mdc` | 묻지 말고 실행 — 브랜치, skill, MCP, verify, 머지 pull                                                 |
| Hooks         | `.cursor/hooks.json`           | Loop scripts ([docs](https://cursor.com/docs/agent/hooks))                                             |
| Skills        | `.agents/skills/`              | Deep workflows ([docs](https://cursor.com/docs/context/skills))                                        |
| Subagents     | `.cursor/agents/`              | Isolated verify ([docs](https://cursor.com/docs/subagents))                                            |
| MCP           | `.cursor/mcp.json`             | Playwright + lucide-animated ([docs](https://cursor.com/docs/context/mcp))                             |
| Commands      | _(none)_                       | `/` slash는 사용자가 켜는 것. 자동 루프는 skill + hook.                                                |

Do not duplicate skill or DESIGN.md content in rules. Point to canonical files (`@DESIGN.md`). Project rule: `.cursor/rules/design.mdc`. Do not copy skills into `.cursor/skills/` — `.agents/skills/` is already a project skill root.

## Skill catalog

| Skill             | Path                                          | When                                         |
| ----------------- | --------------------------------------------- | -------------------------------------------- |
| Turborepo         | `.agents/skills/turborepo/`                   | turbo.json, tasks, caching, packages         |
| Git commit / PR   | `.agents/skills/git-commit/`                  | 커밋·PR·머지했어 (한글, 묻지 말고 실행)      |
| React / Next perf | `.agents/skills/vercel-react-best-practices/` | components, pages, data fetching             |
| Accessibility     | `.agents/skills/accessibility/`               | a11y, WCAG                                   |
| Fix a11y          | `.agents/skills/fixing-accessibility/`        | component a11y fixes                         |
| Web performance   | `.agents/skills/performance/`                 | Lighthouse, loading                          |
| Core Web Vitals   | `.agents/skills/core-web-vitals/`             | LCP, INP, CLS                                |
| UI review         | `.agents/skills/web-design-guidelines/`       | UI/UX audit                                  |
| Motion for React  | `.agents/skills/motion-react/`                | UI motion, gestures, layout, exit            |
| Motion perf       | `.agents/skills/fixing-motion-performance/`   | motion performance tuning                    |
| GSAP (8)          | `.agents/skills/gsap-*/`                      | scroll, timeline, React GSAP                 |
| Create component  | `.agents/skills/create-component/`            | new `@repo/ui` component                     |
| Feature-Sliced    | `.agents/skills/feature-sliced-design/`       | `apps/web`·`apps/docs` 구조 (UI 패키지 제외) |
| lucide-animated   | https://lucide-animated.com/mcp               | Button 등 아이콘 검색·설치                   |
| Playwright MCP    | `.cursor/mcp.json` `playwright`               | UI 변경 후 라이트/다크 자동 확인             |
| UI verifier       | `.cursor/agents/ui-verifier.md`               | Playwright 노이즈를 서브에이전트에 격리      |
| Ship UI change    | `.agents/skills/ship-ui-change/`              | UI 끝나면 요청 없이 verify                   |
| Sync project docs | `.agents/skills/sync-project-docs/`           | 구조·API·토큰 바뀌면 README/DESIGN 맞춤      |

Install updates: `npx skills add <owner/repo> --skill <name>`

## Turborepo (official)

- Read `.agents/skills/turborepo/SKILL.md` before changing `turbo.json`
- Search docs: `turbo docs "<query>"`

## Storybook

```bash
pnpm --filter @repo/ui storybook
pnpm --filter @repo/ui build-storybook
```

Co-located stories: `packages/ui/src/*.stories.tsx`. Foundations: `packages/ui/src/foundations/*.stories.tsx` (사이드바 **파운데이션** / **컴포넌트**, 카피 한글). Theme toolbar: `@storybook/addon-themes` (`html.light` / `html.dark`). Not included in `pnpm verify`.

## Motion for React (official)

- Read `.agents/skills/motion-react/SKILL.md` before UI motion work
- Doc index: `https://motion.dev/llms.txt` → `WebFetch` the matching page (start: `https://motion.dev/docs/react`)

## Tailwind CSS

- Visual spec: [DESIGN.md](DESIGN.md) — rule `.cursor/rules/design.mdc`, session hook `.cursor/hooks.json`
- Shared theme: `@repo/ui/styles.css` — design tokens in `@theme`
- Apps: `@import "@repo/ui/styles.css"` + `@source` for app TSX
- Class merge: `@repo/ui/cn`
- Rule: `.cursor/rules/styling.mdc`

## shadcn Registry (external install)

- Root [registry.json](registry.json) — GitHub Registry for other Next.js apps
- `pnpm dlx shadcn@latest add minoong/design-monogatari/badge` (after public merge)
- Rule: `.cursor/rules/shadcn-registry.mdc`

## Lint & format

| Config   | Path                                                            |
| -------- | --------------------------------------------------------------- |
| ESLint   | `@repo/eslint-config` — jsx-a11y, import sort, Tailwind v4 lint |
| Prettier | `@repo/prettier-config` — single quotes, Tailwind class sort    |

| Command             | Role                           |
| ------------------- | ------------------------------ |
| `pnpm format`       | Write Prettier                 |
| `pnpm format:check` | Check formatting (in `verify`) |
| `pnpm lint`         | ESLint per package             |
| `pnpm verify`       | format + lint + types + build  |

- Editor: `.editorconfig`, `.vscode/settings.json` (format on save)
- Hooks: husky pre-commit → lint-staged
- CI: `.github/workflows/ci.yml` → `pnpm verify`
- Rule: `.cursor/rules/code-quality.mdc`

## This repository

```
apps/web, apps/docs     Next.js apps (ports 3000, 3001) — FSD in src/
packages/ui             @repo/ui — JIT internal package
packages/*-config       shared eslint / typescript / prettier
```

- `@repo/ui` imports: `@repo/ui/button` (subpath, no barrels)
- Apps: Next `app/` re-exports FSD `src/_app` + `src/_pages`. Rule: `.cursor/rules/fsd-apps.mdc`

## Verification (definition of done)

Do not wait for the user to ask. After UI / token / Storybook changes:

1. Playwright MCP (`.cursor/mcp.json` `playwright`) — Storybook light **and** dark. Prefer subagent `.cursor/agents/ui-verifier.md`.
2. `.agents/skills/ship-ui-change/SKILL.md` → `pnpm verify`

A `stop` hook (`.cursor/hooks/ui-verify.mjs`) continues the agent if this is skipped. `postToolUse` nudges mid-loop. `subagentStop` continues if a child edited UI and skipped verify.

Do not commit or push unless the user asks.

## Git workflow

- Skill: `.agents/skills/git-commit/SKILL.md`
- **작업 전**: feature branch from `main` (`feat/`, `fix/`, `chore/` …). Default branch is **`main`**, not `master`.
- **`main`에 직접 커밋하지 않음**
- **커밋·push·PR**: 사용자 요청 시에만, **한글** Conventional Commits
- **PR 머지 후**: 사용자가 머지했다고 알리면 에이전트가 `main` 체크아웃 + `git pull origin main` 실행 (skill §7)

## Scaffolding

```bash
pnpm --filter @repo/ui generate:component
```
