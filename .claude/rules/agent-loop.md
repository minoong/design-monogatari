# Agent loop

Do not ask “확인할까요?”, “커밋할까요?”, “이어서 할까요?”, “문서도 업데이트할까요?”. Infer from the request, the diff, and this repo’s harness, then act.

1. **Before code changes**: feature branch from `main` (`feat/` `fix/` `chore/`). Never commit on `main`. Default branch is `main`, not `master`.
2. **Skills** (`.claude/skills/`, symlinks to `.agents/skills/`): invoke the matching skill instead of waiting for a paste or `/skill`.
3. **MCP**: `lucide-animated` is in `.mcp.json`. Playwright is defined inline in the `ui-verifier` subagent only — delegate browser checks to it instead of looking for Playwright tools in the main session.
4. **UI / tokens / Storybook done**: Playwright light **and** dark, then `pnpm verify`. Delegate to the `ui-verifier` subagent (`.claude/agents/ui-verifier.md`). The `Stop` hook blocks finishing if this is skipped.
5. **Human docs**: 구조·DS API·토큰·스크립트가 바뀌면 `README.md` / `DESIGN.md` / nested `AGENTS.md`를 요청 없이 맞춤. Skill: `sync-project-docs`.
   - 앱 구조·포트·패키지 → `README.md` (+ `apps/*/AGENTS.md`)
   - 토큰·컴포넌트 public API → `DESIGN.md` (폴더 트리·FSD는 넣지 않음)
   - 새 skill/rule/hook → 루트 `AGENTS.md` 카탈로그와 `CLAUDE.md`
6. **Commit / push / PR**: after the work is verified (`pnpm verify`, plus `ui-verifier` for UI), commit with a detailed Korean body, push, and open the PR yourself — **one PR at a time**: the next PR starts only after the user reports the merge. Never push to `main`, force-push, or delete branches without being asked. **Merge notice** (“머지했어”): `git checkout main && git pull origin main` — do not only print the commands.
7. **Official docs first**: before writing or changing code that depends on an external API (Turborepo, Next.js, React, Motion, GSAP, Radix, Tailwind v4, Storybook, shadcn registry), read the matching skill or official docs — for long pages ask the `docs-researcher` subagent (skill `official-docs`). The `docs-consult` hook reminds you once per topic when you edit such code without having done so.
