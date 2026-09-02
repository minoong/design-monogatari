---
name: create-component
description: >-
  @repo/ui React 컴포넌트 생성. subpath export, named export, a11y·React best practices 적용.
  새 컴포넌트, UI 추가, generate component 요청 시 적용.
paths:
  - "packages/ui/**"
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
| motion 성능     | `.agents/skills/fixing-motion-performance/SKILL.md`   |

## 스타일 (planned)

- Tailwind CSS (도입 전까지 CSS Module 허용)
- UI motion: Framer Motion (planned)
- Scroll/timeline: GSAP + ScrollTrigger

## 완료

`.agents/skills/ship-ui-change/SKILL.md` — `pnpm verify` 실행
