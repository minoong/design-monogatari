---
name: create-component
description: >-
  @repo/ui React 컴포넌트 생성. subpath export, named export, a11y·React best practices 적용.
  새 컴포넌트, UI 추가, generate component 요청 시 적용.
paths:
  - 'packages/ui/**'
---

# @repo/ui 컴포넌트 생성

## 스캐폴딩 (선택)

```bash
pnpm --filter @repo/ui generate:component
```

## 체크리스트

1. **파일**: `packages/ui/src/<Name>.tsx` (PascalCase 파일명)
2. **export**: named export, `"use client"`는 필요할 때만
3. **package.json exports**: `./*` 패턴으로 자동 — barrel `index.ts` 금지
4. **import**: 앱에서 `@repo/ui/<kebab-name>` subpath
5. **참조**: @packages/ui/src/button.tsx

## 함께 읽을 skill

| 상황            | Skill                                                 |
| --------------- | ----------------------------------------------------- |
| React/Next 패턴 | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| 접근성          | `.agents/skills/accessibility/SKILL.md`               |
| GSAP 애니메이션 | `.agents/skills/gsap-react/SKILL.md`                  |
| UI motion       | `.agents/skills/motion-react/SKILL.md`                |
| motion 성능     | `.agents/skills/fixing-motion-performance/SKILL.md`   |

## 스타일

- **Tailwind CSS v4** — utility classes, `@theme` 토큰 사용
- `cn()` — 패키지 내부 `./lib/cn`, 앱에서 `@repo/ui/cn`
- 새 CSS Module 금지 (Tailwind로 표현 불가한 경우만 예외)
- UI motion: Motion (`motion/react`, planned) — `transition-*` 클래스와 Motion 동시 사용 금지
- Scroll/timeline: GSAP + ScrollTrigger

## Registry (external apps)

새 UI 컴포넌트를 외부 Next.js 앱에 배포할 때:

1. `registry/design-monogatari/<kebab-name>.tsx` — `@/lib/utils` import
2. `registry.json`에 item 추가 (`registryDependencies`: `minoong/design-monogatari/cn`, `minoong/design-monogatari/theme`)
3. `pnpm dlx shadcn@latest registry validate minoong/design-monogatari`

## 완료

1. `pnpm format` (또는 staged 파일은 pre-commit hook)
2. `pnpm --filter @repo/ui lint` (해당 패키지 변경 시)
3. `.agents/skills/ship-ui-change/SKILL.md` — `pnpm verify`
