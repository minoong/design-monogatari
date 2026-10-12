# docs

design-monogatari 디자인 시스템의 사용 안내 사이트입니다 (port **3001**).

```bash
pnpm --filter docs dev     # http://localhost:3001
pnpm --filter docs build
```

## 현재 상태

[Fumadocs](https://www.fumadocs.dev) 골격입니다. 소개 페이지, 프레임워크 선택 기록(ADR), 검색, `llms.txt`(에이전트용 문서 노출)가 동작합니다. 컴포넌트·파운데이션·AI 워크플로우 페이지는 순서대로 추가됩니다. 구조는 [AGENTS.md](AGENTS.md), 디자인 토큰은 루트 [DESIGN.md](../../DESIGN.md)를 참고하세요.

- 콘텐츠는 `content/docs/**`(MDX)에 두고, 사이드바는 폴더별 `meta.json`으로 정렬합니다.
- 구조: `src/_app`(루트 레이아웃, 스타일, route handler 구현), `src/_pages`(페이지), `src/shared`(콘텐츠 로더, MDX 컴포넌트). Next `app/`은 re-export만 합니다.
- 컴포넌트는 `@repo/ui/*` 서브패스로 가져옵니다.
- 주소: `/docs`(문서), `/llms.txt`, `/llms-full.txt`, `/docs/<경로>.md`(페이지 원문), `/api/search`.
