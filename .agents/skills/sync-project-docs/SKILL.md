---
name: sync-project-docs
description: >-
  코드와 사람용 문서를 맞춰 둔다. 앱 구조(FSD), @repo/ui public API, 토큰, 패키지·포트·스크립트,
  에이전트 하네스가 바뀌면 사용자가 “문서도 업데이트해”라고 하기 전에 README.md, DESIGN.md,
  nested AGENTS.md, 패키지 README를 고친다.
paths:
  - 'apps/**'
  - 'packages/**'
  - 'DESIGN.md'
  - 'README.md'
  - 'AGENTS.md'
  - 'turbo.json'
  - 'package.json'
  - 'registry.json'
  - '.cursor/rules/**'
  - '.agents/skills/**'
---

# 문서 동기화 (묻지 말고)

“README 업데이트할까요?”, “DESIGN.md도요?” 금지. diff를 보고 아래 표에서 **틀린 문장이 생기는 파일만** 고친다. 안 바뀐 표면은 쓰지 않는다.

## 매핑

| 코드가 바뀌면                                                | 맞출 문서                                                                                                | 넣지 말 것                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/web`·`apps/docs` 레이어, Next `app/` re-export, 포트   | 루트 [README.md](../../../README.md) 표·Develop, `apps/*/AGENTS.md`                                      | [DESIGN.md](../../../DESIGN.md)에 폴더 트리 |
| 패키지 추가·삭제, 루트 스크립트                              | [README.md](../../../README.md)                                                                          | 토큰 표                                     |
| 토큰·시맨틱 색                                               | [DESIGN.md](../../../DESIGN.md) + `packages/ui/src/styles/globals.css` + `registry.json` `theme.cssVars` | README에 hex 복사                           |
| DS public API (compound 조각, `asChild`, variant, a11y 계약) | [DESIGN.md](../../../DESIGN.md) Components, `packages/ui/AGENTS.md` Composition                          | FSD 레이어 이름                             |
| 앱 CSS 경로, ESLint `withTailwindCss`                        | `packages/eslint-config/README.md`                                                                       | DESIGN.md                                   |
| 새 skill / rule / hook                                       | 루트 [AGENTS.md](../../../AGENTS.md) 카탈로그                                                            | DESIGN.md                                   |

## DESIGN.md vs README.md

- **DESIGN.md**: 비주얼·토큰·컴포넌트 계약만. 앱 폴더 구조·FSD·에이전트 하네스는 여기 없음.
- **README.md**: 사람이 레포를 여는 지도 (패키지, 포트, 개발 명령, 앱이 FSD인지).

## 절차

1. `git diff` (또는 이번 작업에서 만진 경로)
2. 표에서 해당 행의 문서만 읽고, 더 이상 사실이 아닌 문장을 고친다
3. UI/토큰/Storybook 파일이 같이 바뀌었으면 `.agents/skills/ship-ui-change/SKILL.md`
4. 커밋은 사용자 요청 전에 하지 않음
