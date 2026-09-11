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
3. **package.json exports**: `./*` → `src/*.tsx`, `./icons/*` → `src/icons/*.tsx` — barrel `index.ts` 금지
4. **import**: 앱에서 `@repo/ui/<kebab-name>` subpath
5. **참조**: 단일 컨트롤 @packages/ui/src/button.tsx · 컴파운드 @packages/ui/src/dialog.tsx. 패턴 표는 `packages/ui/AGENTS.md` Composition patterns.
6. **패턴 고르기** (새 public API):
   - variant만 다르면 props + CVA
   - 트리거/패널/헤더처럼 여러 조각이면 compound (`Root` + parts, 같은 파일, context). render props·HOC 금지
   - 다른 태그로 렌더하면 `asChild` + Radix `Slot`만. `as="a"`·`children` 함수 금지
   - 아이콘 전용은 `IconButton`처럼 thin wrapper. 자식 개수로 레이아웃 추측 금지
7. **Primitive**: 복합 위젯은 Radix (`Dialog`, `Label`). 버튼은 네이티브 `<button>` + `@radix-ui/react-slot` (`asChild`). Base UI 추가 금지.
8. **아이콘**: [lucide-animated](https://lucide-animated.com). MCP `https://lucide-animated.com/mcp`로 검색·설치. 텍스트와 같이 쓸 때는 `Button` 안에 중첩하고 `data-icon="inline-start"` | `"inline-end"`. 아이콘만이면 `IconButton` + 필수 `aria-label`. 자식 개수로 아이콘 전용 레이아웃을 추측하지 않음.
9. **DS 컨트롤**: 호버 scale 금지. 눌림은 Motion `whileTap`(버튼 0.96, 아이콘 버튼 0.9). 채운 버튼은 검정 딤, 보조·투명은 옅은 잉크 워시. `transition-*`와 Motion을 같은 노드에 두지 않음.

## 함께 읽을 skill

| 상황            | Skill                                                 |
| --------------- | ----------------------------------------------------- |
| 조합 패턴       | `packages/ui/AGENTS.md` Composition patterns          |
| React/Next 성능 | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| 접근성          | `.agents/skills/accessibility/SKILL.md`               |
| GSAP 애니메이션 | `.agents/skills/gsap-react/SKILL.md`                  |
| UI motion       | `.agents/skills/motion-react/SKILL.md`                |
| motion 성능     | `.agents/skills/fixing-motion-performance/SKILL.md`   |

## 스타일

- **Tailwind CSS v4** — utility classes, `@theme` 토큰 사용
- `cn()` — 패키지 내부 `./lib/cn`, 앱에서 `@repo/ui/cn`
- 새 CSS Module 금지 (Tailwind로 표현 불가한 경우만 예외)
- UI motion: Motion (`motion/react`) — 버튼 루트에는 쓰지 않음. `transition-*`와 Motion을 같은 노드에 두지 않음
- Scroll/timeline: GSAP + ScrollTrigger

## Registry (external apps)

새 UI 컴포넌트를 외부 Next.js 앱에 배포할 때:

1. `registry/design-monogatari/<kebab-name>.tsx` — `@/lib/utils` import
2. `registry.json`에 item 추가 (`registryDependencies`: `minoong/design-monogatari/cn`, `minoong/design-monogatari/theme`)
3. `pnpm dlx shadcn@latest registry validate minoong/design-monogatari`

## 완료

사용자가 확인을 요청하지 않아도 바로 한다.

1. Playwright MCP — Storybook `html.light` / `html.dark`, 보더·링·눌림
2. `.agents/skills/ship-ui-change/SKILL.md` — `pnpm verify`
3. public API가 생겼거나 바뀌면 `DESIGN.md` Components + `packages/ui/AGENTS.md` Composition (`.agents/skills/sync-project-docs/SKILL.md`)
