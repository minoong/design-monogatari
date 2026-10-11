# docs

design-monogatari 디자인 시스템의 사용 안내 사이트입니다 (port **3001**).

```bash
pnpm --filter docs dev     # http://localhost:3001
pnpm --filter docs build
```

## 현재 상태

아직 create-turbo 템플릿 홈 페이지입니다. 문서 프레임워크(Fumadocs)와 컴포넌트·파운데이션·AI 워크플로우 페이지는 순서대로 추가됩니다. 구조는 [AGENTS.md](AGENTS.md), 디자인 토큰은 루트 [DESIGN.md](../../DESIGN.md)를 참고하세요.

- 구조: `src/_app`(프로바이더, 스타일), `src/_pages`(페이지). Next `app/`은 re-export만 합니다.
- 컴포넌트는 `@repo/ui/*` 서브패스로 가져옵니다.
