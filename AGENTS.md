# Agent Instructions

Project-specific notes for **design-monogatari**. Deep knowledge lives in `.agents/skills/` — do not duplicate in rules.

## Default stack

| Layer             | Choice                                         | Status                     |
| ----------------- | ---------------------------------------------- | -------------------------- |
| Monorepo          | Turborepo + pnpm                               | active                     |
| React             | 19                                             | active                     |
| Design system     | `@repo/ui` (JIT)                               | active                     |
| Styling           | Tailwind CSS                                   | planned                    |
| UI motion         | Framer Motion                                  | planned                    |
| Scroll animation  | GSAP + ScrollTrigger                           | planned (skills installed) |
| Docs              | Storybook                                      | planned                    |
| ESLint / Prettier | `@repo/eslint-config`, `@repo/prettier-config` | active                     |

Alternative libraries require **AskQuestion** + user approval (see `.cursor/rules/stack-guardrails.mdc`).

## Skill catalog

| Skill             | Path                                          | When                                 |
| ----------------- | --------------------------------------------- | ------------------------------------ |
| Turborepo         | `.agents/skills/turborepo/`                   | turbo.json, tasks, caching, packages |
| Git commit / PR   | `.agents/skills/git-commit/`                  | commit, branch, PR (한글)            |
| React / Next perf | `.agents/skills/vercel-react-best-practices/` | components, pages, data fetching     |
| Accessibility     | `.agents/skills/accessibility/`               | a11y, WCAG                           |
| Fix a11y          | `.agents/skills/fixing-accessibility/`        | component a11y fixes                 |
| Web performance   | `.agents/skills/performance/`                 | Lighthouse, loading                  |
| Core Web Vitals   | `.agents/skills/core-web-vitals/`             | LCP, INP, CLS                        |
| UI review         | `.agents/skills/web-design-guidelines/`       | UI/UX audit                          |
| Motion perf       | `.agents/skills/fixing-motion-performance/`   | Framer / motion                      |
| GSAP (8)          | `.agents/skills/gsap-*/`                      | scroll, timeline, React GSAP         |
| Create component  | `.agents/skills/create-component/`            | new `@repo/ui` component             |
| Ship UI change    | `.agents/skills/ship-ui-change/`              | before marking work done             |

Install updates: `npx skills add <owner/repo> --skill <name>`

## Turborepo (official)

- Read `.agents/skills/turborepo/SKILL.md` before changing `turbo.json`
- Search docs: `turbo docs "<query>"`

## This repository

```
apps/web, apps/docs     Next.js apps (ports 3000, 3001)
packages/ui             @repo/ui — JIT internal package
packages/*-config       shared eslint / typescript / prettier
```

- `@repo/ui` imports: `@repo/ui/button` (subpath, no barrels)

## Verification (definition of done)

Follow `.agents/skills/ship-ui-change/SKILL.md`:

```bash
pnpm verify
```

Do not commit or push unless the user asks.

## Git workflow

- Skill: `.agents/skills/git-commit/SKILL.md`
- **작업 전**: feature branch from `main` (`feat/`, `fix/`, `chore/` …)
- **`main`에 직접 커밋하지 않음**
- **커밋·push·PR**: 사용자 요청 시에만, **한글** Conventional Commits

## Scaffolding

```bash
pnpm --filter @repo/ui generate:component
```
