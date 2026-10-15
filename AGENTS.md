# Agent Instructions

Project-specific notes for **design-monogatari**. Deep knowledge lives in `.agents/skills/` — do not duplicate in rules.

## Default stack

| Layer             | Choice                                         | Status |
| ----------------- | ---------------------------------------------- | ------ |
| Node              | 24+ (`.nvmrc`)                                 | active |
| Monorepo          | Turborepo + pnpm                               | active |
| React             | 19                                             | active |
| Design system     | `@repo/ui` (JIT)                               | active |
| Styling           | Tailwind CSS v4                                | active |
| UI motion         | Framer Motion                                  | active |
| Scroll animation  | GSAP + ScrollTrigger                           | active |
| 3D vehicle        | Three.js + R3F (`@repo/vehicle-3d`)            | active |
| Docs              | Storybook (`@repo/ui`), Fumadocs (`apps/docs`) | active |
| ESLint / Prettier | `@repo/eslint-config`, `@repo/prettier-config` | active |

UI 모션은 Motion. 스크롤·핀·스크럽은 GSAP (`ScrollImageSequence`, 견적 외장). 3D 차량은 스크롤과 연동하지 않고 OrbitControls로 드래그 회전·휠 줌. 같은 요소에 Motion과 GSAP를 섞지 마세요. WebGL 캔버스에 Motion을 넣지 마세요. `three`는 `@repo/vehicle-3d`에만 — `@repo/ui`·`apps/web`·`apps/docs`에서 직접 import 금지(앱은 `@repo/vehicle-3d/viewer`를 클라이언트 전용으로). 세부: `packages/ui/AGENTS.md`, [DESIGN.md](DESIGN.md).

Alternative libraries require **AskUserQuestion** + user approval (see `.claude/rules/stack-guardrails.md`).

## Claude Code context ([docs](https://code.claude.com/docs/ko/memory))

| Layer      | Location                                   | Role                                                                                                      |
| ---------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| CLAUDE.md  | repo root + `apps/web`, `packages/ui`      | Project instructions. Nested files import their folder's `AGENTS.md`                                      |
| Rules      | `.claude/rules/*.md`                       | Always-on, or scoped with `paths:` frontmatter                                                            |
| Agent loop | `.claude/rules/agent-loop.md`              | 묻지 말고 실행 — 브랜치, skill, MCP, verify, 머지 pull                                                    |
| Hooks      | `.claude/settings.json` → `.claude/hooks/` | SessionStart context, UI verify loop (PostToolUse / Stop / SubagentStop), docs-consult (PreToolUse nudge) |
| Skills     | `.agents/skills/`                          | Deep workflows. `.claude/skills/<name>` are symlinks to them                                              |
| Subagents  | `.claude/agents/`                          | Isolated verify (`ui-verifier`)                                                                           |
| MCP        | `.mcp.json`                                | `lucide-animated`, `storybook` (needs the dev server). Playwright is defined inline in `ui-verifier` only |
| Commands   | _(none)_                                   | `/` slash는 사용자가 켜는 것. 자동 루프는 skill + hook.                                                   |

Do not duplicate skill or DESIGN.md content in rules. Point to canonical files (`DESIGN.md`). Project rule: `.claude/rules/design.md`. Do not copy skills into `.claude/skills/` — symlink them from `.agents/skills/`.

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
| GSAP (7)          | `.agents/skills/gsap-*/`                      | scroll, timeline, React GSAP                 |
| Create component  | `.agents/skills/create-component/`            | new/changed `@repo/ui` component (full loop) |
| Feature-Sliced    | `.agents/skills/feature-sliced-design/`       | `apps/web`·`apps/docs` 구조 (UI 패키지 제외) |
| lucide-animated   | https://lucide-animated.com/mcp               | Button 등 아이콘 검색·설치                   |
| Playwright MCP    | `.claude/agents/ui-verifier.md` (inline)      | UI 변경 후 라이트/다크 자동 확인             |
| UI verifier       | `.claude/agents/ui-verifier.md`               | Playwright 노이즈를 서브에이전트에 격리      |
| A11y reviewer     | `.claude/agents/a11y-reviewer.md`             | 읽기 전용 접근성 리뷰 (컴포넌트 변경 후)     |
| Verify            | `.agents/skills/verify/`                      | UI 끝나면, 커밋 직전에 verify                |
| Official docs     | `.agents/skills/official-docs/`               | 외부 API 코드를 쓰기 전 공식 문서 확인 절차  |
| Docs researcher   | `.claude/agents/docs-researcher.md`           | 공식 문서 한 질문을 요약·출처와 함께 답한다  |
| Sync project docs | `.agents/skills/sync-project-docs/`           | 구조·API·토큰 바뀌면 README/DESIGN 맞춤      |

Install updates: `npx skills add <owner/repo> --skill <name>`

## Turborepo (official)

- Read `.agents/skills/turborepo/SKILL.md` before changing `turbo.json`
- Search docs: `turbo docs "<query>"`

## Storybook

```bash
pnpm --filter @repo/ui storybook
pnpm --filter @repo/ui build-storybook
pnpm --filter @repo/ui copy:car   # g05 / HDR (gitignored)
```

Co-located stories: `packages/ui/src/*.stories.tsx`. Foundations: `packages/ui/src/foundations/*.stories.tsx` (사이드바 **파운데이션** / **컴포넌트**, 카피 한글). Theme toolbar: `globalTypes.theme` + `ThemeDecorator` in `packages/ui/.storybook/preview.tsx` (`html.light` / `html.dark`). Fullscreen 스토리는 ThemeDecorator `p-8`을 건너뜁니다. 3D 차량 스토리는 `src/storybook/vehicle-3d/`(크롬만), 엔진은 `packages/vehicle-3d` — public `@repo/ui/*` 아님. Not included in `pnpm verify`.

## Motion for React (official)

- Read `.agents/skills/motion-react/SKILL.md` before UI motion work
- Doc index: `https://motion.dev/llms.txt` → `WebFetch` the matching page (start: `https://motion.dev/docs/react`)

## Tailwind CSS

- Visual spec: [DESIGN.md](DESIGN.md) — rule `.claude/rules/design.md`, session hook `.claude/settings.json`
- Shared theme: `@repo/ui/styles.css` — design tokens in `@theme`
- Apps: `@import "@repo/ui/styles.css"` + `@source` for app TSX
- Class merge: `@repo/ui/cn`
- Rule: `.claude/rules/styling.md`

## shadcn Registry (external install)

- Root [registry.json](registry.json) — GitHub Registry for other Next.js apps; `packages/ui` is the source, `pnpm registry:sync` generates `registry/` and the theme item (`pnpm registry:check` is in `pnpm verify`)
- `pnpm dlx shadcn@latest add minoong/design-monogatari/badge` — consumers need a Radix-based shadcn project (`shadcn init -b radix`)
- Hosted form: `SITE_URL=… pnpm --filter docs registry:build` → `apps/docs/public/r/`
- Consumer e2e: `pnpm registry:consumer-test` (fresh Next app, install all items, tsc + build + CSS check); CI in `.github/workflows/registry.yml`
- Rule: `.claude/rules/shadcn-registry.md`

## Lint & format

| Config   | Path                                                            |
| -------- | --------------------------------------------------------------- |
| ESLint   | `@repo/eslint-config` — jsx-a11y, import sort, Tailwind v4 lint |
| Prettier | `@repo/prettier-config` — single quotes, Tailwind class sort    |

| Command             | Role                                 |
| ------------------- | ------------------------------------ |
| `pnpm format`       | Write Prettier                       |
| `pnpm format:check` | Check formatting (in `verify`)       |
| `pnpm lint`         | ESLint per package                   |
| `pnpm test`         | vitest (estimate model)              |
| `pnpm verify`       | format + lint + types + test + build |

- Editor: `.editorconfig`, `.vscode/settings.json` (format on save)
- Hooks: husky pre-commit → lint-staged
- CI: `.github/workflows/ci.yml` → `pnpm verify`
- Rule: `.claude/rules/code-quality.md`

## This repository

```
apps/web, apps/docs     Next.js apps (ports 3000, 3001) — FSD in src/
packages/ui             @repo/ui — JIT internal package
packages/*-config       shared eslint / typescript / prettier
```

- `@repo/ui` imports: `@repo/ui/button` (subpath, no barrels)
- Apps: Next `app/` re-exports FSD `src/_app` + `src/_pages`. Rule: `.claude/rules/fsd-apps.md`

## Component loop

New or changed `@repo/ui` component: `.agents/skills/create-component/SKILL.md`. `pnpm component:new <name>` scaffolds the story, docs example and page, registry item and DESIGN.md entry (marked `TODO(scaffold)`); `pnpm components:check` (inside `pnpm verify`) fails until every public component has all of them. Korean copy in stories, docs, and the web app is 합쇼체 and car-estimate themed (`.claude/rules/copy-tone.md`; `pnpm copy:check` is inside `pnpm verify`). Exceptions live in `packages/ui/components.config.json` with a reason.

## Verification (definition of done)

Do not wait for the user to ask. After UI / token / Storybook changes:

1. Delegate to subagent `.claude/agents/ui-verifier.md` (Playwright MCP inline) — Storybook light **and** dark.
2. `.agents/skills/verify/SKILL.md` → `pnpm verify`

A `Stop` hook (`.claude/hooks/ui-verify.mjs`) blocks finishing if this is skipped. `PostToolUse` nudges mid-loop. `SubagentStop` holds back a subagent that edited UI and skipped verify.

Do not commit or push unless the user asks.

## Git workflow

- Skill: `.agents/skills/git-commit/SKILL.md`
- **작업 전**: feature branch from `main` (`feat/`, `fix/`, `chore/` …). Default branch is **`main`**, not `master`.
- **`main`에 직접 커밋하지 않음**
- **커밋·push·PR**: 사용자 요청 시에만, **한글** Conventional Commits
- **PR 머지 후**: 사용자가 머지했다고 알리면 에이전트가 `main` 체크아웃 + `git pull origin main` 실행 (skill §7)

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
