# docs app

디자인 시스템 사용 안내 사이트 (port **3001**). 컴포넌트 사용법, 설치(shadcn 레지스트리), 파운데이션, Claude Code 워크플로우 문서를 담는다.

- **프레임워크**: Fumadocs (`@fumadocs/base-ui`의 Spacious `DocsLayout` — Radix 판 `fumadocs-ui`에는 없는 레이아웃, `fumadocs-mdx`). 선택 근거와 스파이크 게이트 결과는 `content/docs/decisions/docs-framework.mdx`.
- **콘텐츠**: `content/docs/**` (MDX, 한국어). 사이드바 순서는 각 폴더의 `meta.json`. `.source/`는 `fumadocs-mdx`가 dev/build 때 만드는 생성물이라 커밋하지 않는다.
- **구조**: FSD in `src/`. `_app`(루트 레이아웃, 전역 CSS, 폰트, `api-routes/`), `_pages/docs`(문서 셸, 페이지, 메타데이터), `_pages/home`(`/` → `/docs` 리다이렉트), `shared/`(`lib/source.ts` 콘텐츠 로더, `layout-options.tsx`, `ui/mdx-components.tsx`). Next `app/`은 re-export만 하고 route handler 구현은 `src/_app/api-routes/`에 둔다. 예외는 `.claude/rules/fsd-apps.md`.
- **에이전트용 노출**: `/llms.txt`, `/llms-full.txt`, 페이지마다 `/docs/<경로>.md`(rewrite → `/llms.mdx/docs/…`), 검색 `/api/search`.
- **테마**: `RootProvider`(next-themes, `attribute: 'class'`)가 `html.light` / `html.dark`를 전환한다. `globals.css`의 "테마 브리지"가 `--color-fd-*`를 `@repo/ui` 토큰에 연결하므로, 문서 크롬 색을 바꾸려면 Fumadocs 클래스가 아니라 이 브리지를 고친다.
- **반경**: `@theme inline`이 `rounded-md/lg`에 값을 박아 넣어서 변수 덮어쓰기가 안 먹는다. 크롬은 `globals.css`에서 클래스를 겨냥해 되돌리고, 문서 안에서 `@repo/ui` 컴포넌트를 보여 주는 영역은 `data-ds-preview`로 표시해 제외한다.
- **문서 블록** (`src/shared/ui/doc-blocks/`, MDX에서 바로 사용): `ComponentPreview name="button/variants"`(예시 파일을 라이브 렌더 + 같은 파일을 코드 탭에), `InstallTabs name="button"`(`registry.json`에서 읽은 CLI/수동 설치), `PropsTable`(소스 타입을 읽는 props 표. 우리가 정의한 props만 `include`로 고르고 설명은 한국어로 직접 준다), `RepoFile path lines`(저장소 파일을 빌드 시 읽는 코드 블록), 파운데이션용 `Palette`·`ColorTokens`·`TypeScale`·`RadiusScale`(`registry.json`의 theme 항목에서 값을 읽고, 글자 토큰은 배경 대비 비율을 계산해 보여 준다. 토큰 값을 페이지에 손으로 적지 않는다). 모두 빌드 시 `fs`로 읽는 서버 컴포넌트라 페이지는 정적이다.
- **예시**: `src/_examples/<컴포넌트>/<이름>.tsx` (default export). FSD 레이어가 아니라 docs 전용 폴더다. 프리뷰 영역은 `data-ds-preview`로 감싸져 문서 크롬의 반경 보정과 링크 밑줄에서 제외된다.
- **새 컴포넌트 문서 추가**: ① `src/_examples/<name>/*.tsx` 예시 작성 ② `content/docs/components/<name>.mdx`를 `button.mdx` 형식(프리뷰 → 설치 → 사용법 → 예시 → API 레퍼런스 → 접근성 → 소스)으로 작성 ③ `content/docs/components/meta.json` `pages`에 추가. 설치 탭은 `registry.json` 항목이 있어야 한다.
- **에이전트용 Markdown**: `src/shared/lib/remark-doc-blocks.ts`가 `/llms-full.txt`, 페이지별 `.md`, Copy Markdown에서 블록을 코드·표로 펼치고 `<Callout>`을 인용문으로 바꾼다 (`replaceSource`라 렌더링은 그대로). 블록이 읽는 정보는 페이지와 같은 함수(`install-info`, `props-info`, `repo-file`)로 읽어 둘이 어긋나지 않는다. **새 블록을 만들면 `expanders`에도 추가한다.** `defineDocs`의 `mdxOptions`는 반드시 `applyMdxPreset(...)`으로 감싼다: 객체로 직접 주면 기본 프리셋이 빠져 `/api/search`가 500이 된다.
- **테마**: 시스템 설정을 따르고(`defaultTheme: system`), 헤더의 해/달 버튼(`shared/ui/theme-toggle.tsx`)과 "…" 메뉴의 System/Light/Dark, `d` 단축키로 바꾼다. Spacious 레이아웃이 클라이언트 컴포넌트라 `slots`는 `_pages/docs/ui/docs-layout-client.tsx`에서 조립한다.
- UI from `@repo/ui/*`.
- `.mdx`는 Prettier 대상(린트 대상 아님). 생성물(`.source`, `public/r`)은 `.prettierignore`에 있다.
- 전역 CSS(`src/_app/styles/globals.css`)에 `overflow-x: hidden`이나 unlayered 링크 리셋(`a { color: inherit }`)을 넣지 말 것: sticky 사이드바와 문서 프레임워크의 링크 색을 깨뜨린다.

Skill: `.agents/skills/feature-sliced-design/SKILL.md`. Rule: `.claude/rules/fsd-apps.md`.

After UI or token changes, do not wait to be asked: `ui-verifier` subagent (light/dark), then `pnpm verify`. See root `AGENTS.md` and `.claude/agents/ui-verifier.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
