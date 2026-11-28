---
paths:
  - 'packages/ui/**/*.{ts,tsx}'
  - 'apps/**/*.{ts,tsx}'
---

# Animation

| Use case                                    | Tool                                                                                          | Skill                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Hover, enter/exit, layout UI motion         | Motion (`motion/react-client` for components, `motion/react` for hooks and `AnimatePresence`) | `motion-react`, `fixing-motion-performance` |
| Scroll-linked, pin, scrub, complex timeline | GSAP + ScrollTrigger                                                                          | `gsap-scrolltrigger`, `gsap-timeline`       |
| React integration                           | GSAP in components                                                                            | `gsap-react`                                |
| Performance                                 | transforms, avoid layout thrash                                                               | `gsap-performance`                          |
| 3D vehicle (rotate, zoom, paint)            | Three `OrbitControls`, no page-scroll coupling                                                | `packages/vehicle-3d/AGENTS.md`             |

## Motion budget

Tokens: `@repo/ui/motion` (`DURATION`, `EASE`, `SPRING`, `STAGGER`, `reducedTransition`) and the CSS `animate-select-pop` / `animate-select-out` (driven by `useCheckPhase` from `./lib/check-phase`, so first paint stays still). Use them instead of ad-hoc numbers; the table and rationale are in DESIGN.md "Motion" and docs 파운데이션 > 모션.

- Motion marks a **state change** (select, enter, move, load). No ambient/looping decoration, no cursor-following effects on the estimate flow.
- Animate `opacity` and `transform` only. One large flourish (`DURATION.hero`, `SPRING.bouncy`) per screen.
- Read `useReducedMotion()` live (not once at mount): drop translation, keep a `DURATION.instant` fade. CSS animations carry `motion-reduce:animate-none`.
- Anything that loops must pause off-screen. New animated components get a story that shows the motion plus a replay control.
- **랜딩 예외 (사용자 결정):** 문서 앱 랜딩(`apps/docs/src/_pages/home/ui/landing/`)의 WebGL SUV는 빛 띠가 스크롤·커서와 상관없이 계속 돌고 커서에 반응한다. 이 규칙의 "상시 장식·커서 추적 금지"에 어긋나지만 **랜딩 히어로·색 고르기 장면·닫는 구역 한정**으로 허용한다. 견적 흐름(`apps/web`)과 `@repo/ui` 컴포넌트에는 적용하지 않는다. 화면 밖·감소 모션에서는 그리기를 멈추고, 정지 수단이 없다는 점(WCAG 2.2.2)은 알고 받아들인 한계다. 같은 랜딩의 스크롤 연출(`.lp-*`)은 스크롤에 묶인 CSS 타임라인이다.
- Do not copy third-party animation component code (React Bits is MIT + Commons Clause and forbids redistribution, which our shadcn registry would be). Re-implement against our tokens instead. The intro page tried React Bits components and they were removed again (user decision, 2026-11-25): build with our own components (`@repo/ui`).

Before implementing Motion APIs, invoke the `motion-react` skill and fetch official docs via `https://motion.dev/llms.txt`.

Same-element and WebGL-canvas restrictions: see "Rules that are easy to violate" in `CLAUDE.md`. Do not drive the 3D vehicle from page scroll. The estimate app intro (`apps/web/src/_pages/intro`) uses no live WebGL: its car is pre-rendered frames of the 3D model (`public/intro/`) pinned and scrubbed by GSAP through `ScrollImageSequence`, with overlay copy tied to `--sequence-progress` in CSS; first-screen copy rises once by CSS (`intro-rise`) and later copy once in view (`Reveal`). Off under reduced motion. Nothing loops by time or follows the cursor, and the estimate wizard (`/estimate`) uses none of it. If unclear, use AskUserQuestion.

Register GSAP plugins before use; cleanup in `useEffect` / `useGSAP`.
