---
name: ship-ui-change
description: >-
  UI 변경 완료 전 품질 검증. format/lint/type/build를 실행하고 실패 시 수정.
  작업 완료, PR 전, ship, verify 요청 시 적용.
paths:
  - "packages/ui/**"
  - "apps/**"
---

# UI 변경 완료 (Definition of Done)

작업을 "완료"로 표시하기 **전에** 반드시 검증한다.

## 절차

1. 변경 범위 파악 (`git status`, `git diff`)
2. 전체 검증 실행:

```bash
pnpm verify
```

또는 영향 패키지만:

```bash
pnpm format:check
turbo run lint check-types build --filter=@repo/ui --filter=web --filter=docs
```

3. **실패 시** 로그 확인 → 수정 → 2번 재실행
4. 모두 통과할 때까지 "완료" 보고 금지

## 보고 형식

```
검증 결과
- format:check: pass/fail
- lint: pass/fail
- check-types: pass/fail
- build: pass/fail
```

## PR 전 (사용자 요청 시)

- `.agents/skills/git-commit/SKILL.md` — 한글 Conventional Commit
- PR test plan에 `pnpm verify` 체크박스 포함

## 금지

- 검증 없이 "완료" 선언
- 사용자 요청 없이 commit / push / PR
