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

## Git 워크플로

- Skill: `.agents/skills/git-commit/SKILL.md`
- **작업 전**: `main`에서 feature 브랜치 생성 (`feat/`, `fix/`, `chore/` …)
- **`main`에 직접 커밋하지 않음**
- **커밋·push·PR**: 사용자 요청 시에만
- PR: `gh pr create`, 제목·본문 **한글**, test plan에 `pnpm verify`

## 커밋 메시지

- Skill: `.agents/skills/git-commit/SKILL.md` ([awesome-copilot git-commit](https://www.skills.sh/github/awesome-copilot/git-commit) + 한글)
- Conventional Commits + diff 분석 + Git 안전 프로토콜
- **제목·본문은 한글**

## Scaffolding

```bash
pnpm --filter @repo/ui generate:component
```
