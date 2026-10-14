---
name: official-docs
description: >-
  외부 라이브러리 API에 의존하는 코드를 쓰거나 바꾸기 전에 공식 문서를 먼저 확인하는 절차. 어떤 라이브러리가
  어느 문서(로컬 문서, llms.txt, 스킬)에서 확인되는지 안내한다.
when_to_use: >-
  Turborepo(turbo.json), Next.js(apps/web, apps/docs), Motion, GSAP, Radix, Tailwind v4(@theme, 변형),
  Storybook, shadcn 레지스트리, Fumadocs, Vitest 코드를 구현·수정하기 전. 훅이 "공식 문서 확인 기록 없음"이라고
  알렸을 때. 버전이 학습 데이터보다 새로울 수 있는 라이브러리의 API를 기억에 의존해 쓰려는 순간.
paths:
  - 'turbo.json'
  - 'apps/**'
  - 'packages/ui/**'
  - 'packages/vehicle-3d/**'
---

# 공식 문서 먼저

기억만으로 API를 쓰지 않는다. 이 저장소는 Next 16, React 19, Tailwind v4, Motion 14, TypeScript 7처럼 학습 데이터보다 새로운
버전을 쓴다. `.claude/hooks/docs-consult.mjs`는 의존 코드를 고치기 직전에 확인 기록이 없으면 한 번 알린다.

## 어디서 확인하는가

| 주제              | 먼저                                                                | 그다음                                                         |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Next.js           | `node_modules/next/dist/docs/`의 해당 가이드 (`apps/web/AGENTS.md`) | https://nextjs.org/docs                                        |
| Turborepo         | `turborepo` 스킬, `turbo docs "<질문>"`                             | https://turborepo.dev/docs                                     |
| Motion            | `motion-react` 스킬                                                 | https://motion.dev/llms.txt 의 해당 페이지                     |
| GSAP              | `gsap-*` 스킬 (react, scrolltrigger, timeline)                      | https://gsap.com/docs/v3/                                      |
| Tailwind v4       | `styling.md` 규칙                                                   | https://tailwindcss.com/docs (theme, variants)                 |
| Radix             | —                                                                   | https://www.radix-ui.com/primitives/docs                       |
| shadcn 레지스트리 | `shadcn-registry.md` 규칙                                           | https://ui.shadcn.com/docs/registry                            |
| Storybook         | —                                                                   | https://storybook.js.org/docs                                  |
| Fumadocs          | `apps/docs/AGENTS.md`                                               | https://www.fumadocs.dev/docs                                  |
| React             | `vercel-react-best-practices` 스킬                                  | https://react.dev                                              |
| Vitest            | —                                                                   | https://vitest.dev                                             |
| Claude Code       | —                                                                   | https://code.claude.com/docs/llms.txt (한국어: `/docs/ko/...`) |

## 방법

1. 문서가 길면 **docs-researcher 서브에이전트**에 질문한다. 요약과 출처 URL만 받아 컨텍스트를 아낀다
   (한 페이지가 70KB를 넘기도 한다). 질문은 구체적으로: "Motion 14에서 `layoutId`를 쓰는 요소를
   `AnimatePresence` 없이 언마운트할 때 동작은?"
2. 스킬이 있으면 스킬을 호출한다. 스킬 본문이 문서의 요약이다.
3. 직접 읽을 때는 `llms.txt` 같은 색인에서 해당 페이지 하나만 가져온다.
4. 문서와 저장소 코드가 어긋나면 문서가 아니라 **설치된 버전**이 기준이다(`pnpm why <pkg>`, `node_modules/<pkg>/package.json`).
5. 확인한 사실(버전, 제약)이 이 저장소 규칙을 바꾸면 해당 규칙 파일이나 DESIGN.md에 한 줄로 남긴다.

## 하지 않는 것

- 문서 내용을 저장소에 복사해 두지 않는다(오래된다). 링크와 "무엇을 확인했는지"만 남긴다.
- 서드파티 컴포넌트 코드를 문서에서 가져와 붙이지 않는다. 라이선스를 먼저 확인한다(React Bits는 재배포 금지).
