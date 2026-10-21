---
name: verify
description: >-
  UI·토큰·Storybook·문서 사이트 변경이 끝나면 사용자 요청 없이 바로 검증한다.
  라이트/다크를 ui-verifier로 보고, 이어서 pnpm verify(format·lint·types·test·build)를 돌린다.
  작업 완료와 커밋 직전에도 적용.
paths:
  - 'packages/ui/**'
  - 'apps/**'
  - 'DESIGN.md'
  - 'registry.json'
  - 'registry/**'
---

# 검증 (Definition of Done)

이름이 `verify`인 프로젝트 스킬은 Claude Code가 **커밋 직전에 실행하도록 안내**한다(문서·테스트만 바뀐 커밋은 제외). 그래서 이 이름을 쓴다.

사용자가 "확인해 줘"라고 하지 않아도, UI 작업을 마치면 아래를 실행한다.

문서가 코드와 어긋나면 검증보다 먼저 `.agents/skills/sync-project-docs/SKILL.md` (README / DESIGN / nested AGENTS).

## 절차

1. 변경 범위 파악 (`git status`, `git diff`)
2. 화면이 바뀌면 `ui-verifier` 서브에이전트(`.claude/agents/ui-verifier.md`, Playwright MCP 내장)에 위임: Storybook `html.light`와 `html.dark`, 보더·링·눌림. 스크린샷 한 장이 아니라 상호작용.
3. 전체 검증 실행:

```bash
pnpm verify
```

또는 영향 패키지만:

```bash
pnpm format:check
turbo run lint check-types build --filter=@repo/ui --filter=web --filter=docs
```

4. **실패 시** 로그 확인 → 수정 → 2번부터 재실행
5. 모두 통과할 때까지 "완료" 보고 금지

## 보고 형식

```
검증 결과
- playwright (light/dark): pass/fail
- format:check: pass/fail
- lint: pass/fail
- check-types: pass/fail
- build: pass/fail
```

## PR 전

- `.agents/skills/git-commit/SKILL.md` — 한글 Conventional Commit
- PR test plan에 `pnpm verify` 체크박스 포함

## 금지

- 검증 없이 "완료" 선언
- 검증 없이 commit / push / PR. `main`에 직접 push, force push, 브랜치 삭제는 사용자가 요청할 때만
