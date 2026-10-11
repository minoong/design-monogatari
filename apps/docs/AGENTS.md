# docs app

디자인 시스템 사용 안내 사이트 (port **3001**). 컴포넌트 사용법, 설치(shadcn 레지스트리), 파운데이션, Claude Code 워크플로우 문서를 담는다.

- **현재 상태**: create-turbo 템플릿 홈 페이지. 문서 프레임워크는 **Fumadocs로 채택 결정**(스파이크 통과)했고, 골격 PR에서 연결한다. 그 전까지 `src/_pages/home`만 있다.
- FSD in `src/` (`_app` + `_pages/home`). Next `app/` only re-exports (프레임워크가 요구하는 catch-all 라우트도 re-export만, 예외는 `.claude/rules/fsd-apps.md`).
- UI from `@repo/ui/*`. Theme: `next-themes` + `html.light` / `html.dark`.
- `.mdx`는 Prettier 대상(린트 대상 아님). 생성물(`.source`, `public/r`)은 `.prettierignore`에 있다.
- 전역 CSS(`src/_app/styles/globals.css`)에 `overflow-x: hidden`이나 unlayered 링크 리셋(`a { color: inherit }`)을 넣지 말 것: sticky 사이드바와 문서 프레임워크의 링크 색을 깨뜨린다.

Skill: `.agents/skills/feature-sliced-design/SKILL.md`. Rule: `.claude/rules/fsd-apps.md`.

After UI or token changes, do not wait to be asked: `ui-verifier` subagent (light/dark), then `pnpm verify`. See root `AGENTS.md` and `.claude/agents/ui-verifier.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
