# docs app

디자인 시스템 사용 안내 사이트 (port **3001**). 컴포넌트 사용법, 설치(shadcn 레지스트리), 파운데이션, Claude Code 워크플로우 문서를 담는다.

- **프레임워크**: Fumadocs (`@fumadocs/base-ui`의 Spacious `DocsLayout` — Radix 판 `fumadocs-ui`에는 없는 레이아웃, `fumadocs-mdx`). 선택 근거와 스파이크 게이트 결과는 `docs/decisions/docs-framework.md`(저장소 루트, 문서 사이트에는 싣지 않는다).
- **콘텐츠**: `content/docs/**` (MDX, 한국어). 사이드바 순서는 각 폴더의 `meta.json`. `.source/`는 `fumadocs-mdx`가 dev/build 때 만드는 생성물이라 커밋하지 않는다.
- **구조**: FSD in `src/`. `_app`(루트 레이아웃, 전역 CSS, 폰트, `api-routes/`), `_pages/docs`(문서 셸, 페이지, 메타데이터), `_pages/home`(`/` → `/docs` 리다이렉트), `shared/`(`lib/source.ts` 콘텐츠 로더, `layout-options.tsx`, `ui/mdx-components.tsx`). Next `app/`은 re-export만 하고 route handler 구현은 `src/_app/api-routes/`에 둔다. 예외는 `.claude/rules/fsd-apps.md`.
- **에이전트용 노출**: `/llms.txt`, `/llms-full.txt`, 페이지마다 `/docs/<경로>.md`(rewrite → `/llms.mdx/docs/…`), 검색 `/api/search`.
- **테마**: `RootProvider`(next-themes, `attribute: 'class'`)가 `html.light` / `html.dark`를 전환한다. `globals.css`의 "테마 브리지"가 `--color-fd-*`를 `@repo/ui` 토큰에 연결하므로, 문서 크롬 색을 바꾸려면 Fumadocs 클래스가 아니라 이 브리지를 고친다.
- **반경**: `@theme inline`이 `rounded-md/lg`에 값을 박아 넣어서 변수 덮어쓰기가 안 먹는다. 크롬은 `globals.css`에서 클래스를 겨냥해 되돌리고, 문서 안에서 `@repo/ui` 컴포넌트를 보여 주는 영역은 `data-ds-preview`로 표시해 제외한다.
- **문서 블록** (`src/shared/ui/doc-blocks/`, MDX에서 바로 사용): `ComponentPreview name="button/variants"`(예시 파일을 라이브 렌더 + 같은 파일을 코드 탭에), `InstallTabs name="button"`(`registry.json`에서 읽은 CLI/수동 설치), `PropsTable`(소스 타입을 읽는 props 표. 우리가 정의한 props만 `include`로 고르고 설명은 한국어로 직접 준다), `RepoFile path lines`(저장소 파일을 빌드 시 읽는 코드 블록), 파운데이션용 `Palette`·`ColorTokens`·`TypeScale`·`RadiusScale`(`registry.json`의 theme 항목에서 값을 읽고, 글자 토큰은 배경 대비 비율을 계산해 보여 준다. 토큰 값을 페이지에 손으로 적지 않는다). 모두 빌드 시 `fs`로 읽는 서버 컴포넌트라 페이지는 정적이다.
- **예시**: `src/_examples/<컴포넌트>/<이름>.tsx` (default export). FSD 레이어가 아니라 docs 전용 폴더다. 프리뷰 영역은 `data-ds-preview`로 감싸지고 `not-prose`라서 문서 크롬의 반경 보정, 링크 밑줄, 본문 여백(`.prose p`)에서 제외된다. **포털로 열리는 요소(Dialog 등)는 영역 밖에 그려지므로 예시에서 그 요소에 `data-ds-preview`를 직접 단다.** 이 속성은 코드 탭과 Markdown 출력에서 자동으로 지워진다(`readExampleSource`).
- **새 컴포넌트 문서 추가**: `pnpm component:new <name>`가 예시·페이지·`meta.json` 항목의 뼈대를 만든다(`TODO(scaffold)` 표시). 페이지는 `button.mdx` 형식(프리뷰 → 설치 → 사용법 → 예시 → API 레퍼런스 → 접근성 → 소스). 설치 탭은 `registry.json` 항목이 있어야 하고, `pnpm components:check`가 빠진 것을 잡는다.
- **에이전트용 Markdown**: `src/shared/lib/remark-doc-blocks.ts`가 `/llms-full.txt`, 페이지별 `.md`, Copy Markdown에서 블록을 코드·표로 펼치고 `<Callout>`을 인용문으로 바꾼다 (`replaceSource`라 렌더링은 그대로). 블록이 읽는 정보는 페이지와 같은 함수(`install-info`, `props-info`, `repo-file`)로 읽어 둘이 어긋나지 않는다. **새 블록을 만들면 `expanders`에도 추가한다.** `defineDocs`의 `mdxOptions`는 반드시 `applyMdxPreset(...)`으로 감싼다: 객체로 직접 주면 기본 프리셋이 빠져 `/api/search`가 500이 된다.
- **테마**: 시스템 설정을 따르고(`defaultTheme: system`), 헤더의 해/달 버튼(`shared/ui/theme-toggle.tsx`, `@repo/ui/icons/sun|moon`이 hover·포커스·클릭에서 움직이고 해/달 전환은 SSR 때문에 CSS 클래스로 한다)과 "…" 메뉴의 System/Light/Dark, `d` 단축키로 바꾼다. Spacious 레이아웃이 클라이언트 컴포넌트라 `slots`는 `_pages/docs/ui/docs-layout-client.tsx`에서 조립한다.
- **사이드바 탭**: 「디자인 시스템」(`root: true` 폴더 밖의 모든 문서)과 「AI 워크플로」(`content/docs/ai-workflow/`, `root: true`) 두 개다. `docs-layout-client.tsx`의 `buildTabs`가 주소 목록으로 활성 탭을 판별한다(`getLayoutTabs`는 보고 있는 사이드바 트리 기준이라 다른 탭을 빠뜨린다). 새 최상위 폴더를 추가하면 어느 탭에 속하는지 정한다. 문서 안 코드 조각은 `RepoFile`로 읽으므로 가리킨 파일이나 줄이 바뀌면 `lines`를 맞춘다.
- **쉘 문구 한국어화**: `@fumadocs/base-ui`는 영어 원문을 키로 `t("On this page")`처럼 부른다. `src/shared/lib/translations.ts`의 사전(영어 → 한국어)을 `src/_app/index.tsx`의 `RootProvider i18n={{ locale: 'ko', translations }}`에 넘긴다. 사전에 없는 문구는 영어로 남으므로, 새 라이브러리 문구가 영어로 보이면 사전에 키를 더한다(라우팅용 i18n은 쓰지 않는다).
- **아이콘**: 새 의존성(lucide-react)을 들이지 않으려고 `src/shared/ui/section-icons.tsx`에 선 아이콘 몇 개(Book, Layers, Grid, Terminal, Sparkles, Bot)를 직접 둔다. 프런트매터와 `meta.json`의 `icon: Layers` 같은 이름 문자열을 `shared/lib/source.ts`의 `loader({ icon: iconFor })`가 사이드바 아이콘으로 바꾼다. 탭 아이콘은 `docs-layout-client.tsx`에서 직접 준다. MDX 안에서는 `<SectionIcon name="Grid" />`로 쓴다(`Card`의 `icon`).
- **카드**: `Cards`/`Card`(Fumadocs 기본)는 에이전트용 Markdown에서 `- [제목](주소): 설명` 목록으로 펼쳐진다(`remark-doc-blocks.ts`). `href`는 실제 페이지 주소여야 한다(인덱스 페이지 없는 폴더 주소는 404).
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
