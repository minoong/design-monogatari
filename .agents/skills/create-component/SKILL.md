---
name: create-component
description: >-
  @repo/ui 컴포넌트를 새로 만들거나 공개 API를 바꿀 때 쓴다. 스캐폴드 → 구현 → 스토리 →
  문서 예시·페이지 → 레지스트리 → 누락 검사 → 접근성 리뷰 → 검증까지 한 번에 따라간다.
when_to_use: >-
  "컴포넌트 추가", "UI 추가", "새 컴포넌트", "컴포넌트 변경", "variant 추가" 같은 요청, 또는
  packages/ui/src 의 공개 컴포넌트를 만들거나 props 를 바꾸는 작업.
arguments: [name]
allowed-tools: Bash(pnpm component:new *) Bash(pnpm components:check *) Bash(pnpm registry:sync) Bash(pnpm registry:check)
---

# @repo/ui 컴포넌트 만들기·바꾸기

현재 누락 현황(스킬을 불러올 때 계산됨):

!`pnpm components:check --summary`

사용자가 확인을 요청하지 않아도 끝까지 진행한다. 묻지 않는다.

## 새 컴포넌트 (`$name`)

1. **정독**: `DESIGN.md`(토큰·계약), `packages/ui/AGENTS.md`(Composition patterns 표), 비슷한 기존 컴포넌트(단일 컨트롤 `button.tsx`·`badge.tsx`, 컴파운드 `dialog.tsx`·`card.tsx`). 규약 상세는 [reference.md](reference.md).
2. **스캐폴드**: `pnpm component:new $name` (컴파운드면 `--compound`). 컴포넌트·스토리·예시·문서 페이지·registry 항목·DESIGN.md 항목의 뼈대가 `TODO(scaffold)` 표시와 함께 생기고 `registry:sync`까지 돈다.
3. **구현**: `packages/ui/src/$name.tsx`. 새 의존성은 사용자 승인 없이 추가하지 않는다.
4. **스토리**: 상태별 스토리, 한글 설명(`packages/ui/src/*.stories.tsx` 형식).
5. **예시와 문서**: `apps/docs/src/_examples/$name/*.tsx`와 `apps/docs/content/docs/components/$name.mdx`를 `button.mdx` 형식(프리뷰 → 설치 → 사용법 → 예시 → API → 접근성 → 소스)으로 채운다. 포털로 열리는 요소는 예시에서 `data-ds-preview`를 직접 단다(`apps/docs/AGENTS.md`).
6. **DESIGN.md**: 계약(variant, 접근성, 토큰)을 적는다.
7. **레지스트리**: `registry.json` 항목의 title·description·의존성을 채우고 `pnpm registry:sync`. 복사본은 생성물이라 손으로 고치지 않는다.
8. **누락 검사**: `pnpm components:check`가 통과해야 한다(`TODO(scaffold)`가 하나라도 남으면 실패). `pnpm verify`에도 포함돼 있다.
9. **일관성·접근성 리뷰**: `design-reviewer`(래퍼의 기본값이 감싼 컴포넌트와 같은지, 나란히 놓이는 컨트롤의 크기·모양, 토큰, 간격, 문서와 코드의 일치)와 `a11y-reviewer` 서브에이전트에 바뀐 파일 경로를 알려 읽기 전용 리뷰를 받고 지적을 고친다.
10. **검증**: `ui-verifier`(Storybook과 문서 페이지, 라이트/다크) → `verify` 스킬(`pnpm verify`). 소비자 설치는 CI의 `registry.yml`이 확인한다.

## 기존 컴포넌트 변경

props·variant·접근성 계약이 바뀌면 2번을 빼고 위 순서를 그대로 따른다: 스토리, 예시, 문서 페이지의 API 표와 접근성 절, DESIGN.md, `registry:sync`, 검사, 리뷰, 검증. 공개 API가 바뀌면 `.agents/skills/sync-project-docs/SKILL.md`로 `packages/ui/AGENTS.md`도 맞춘다.

## 금지

- barrel `index.ts`, `render` props, HOC, 훅 없이 `scale` 호버, 하드코딩 hex (규약: reference.md)
- 검사를 통과시키려고 `components.config.json`에 예외를 추가하는 것 (정말 배포·문서 대상이 아닐 때만, 이유와 함께)
- 사용자 요청 없이 commit / push / PR
