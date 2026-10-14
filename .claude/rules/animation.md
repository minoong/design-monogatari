---
paths:
  - 'packages/ui/**/*.{ts,tsx}'
  - 'apps/**/*.{ts,tsx}'
---

# Animation

| Use case                                    | Tool                            | Skill                                                 |
| ------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| Hover, enter/exit, layout UI motion         | Motion (`motion/react`, active) | `motion-react`, `fixing-motion-performance`           |
| Scroll-linked, pin, scrub, complex timeline | GSAP + ScrollTrigger            | `gsap-scrolltrigger`, `gsap-timeline`                 |
| React integration                           | GSAP in components              | `gsap-react`                                          |
| Performance                                 | transforms, avoid layout thrash | `gsap-performance`                                    |
| Storybook 3D paint (pin + yaw)              | GSAP + ScrollTrigger            | `gsap-scrolltrigger`, `packages/vehicle-3d/AGENTS.md` |
| Storybook 3D OEM inspect                    | Three `OrbitControls`           | `packages/vehicle-3d/AGENTS.md`                       |

## Motion budget

Tokens: `@repo/ui/motion` (`DURATION`, `EASE`, `SPRING`, `STAGGER`, `reducedTransition`) and the CSS `animate-select-pop` / `animate-select-out` (driven by `useCheckPhase` from `./lib/check-phase`, so first paint stays still). Use them instead of ad-hoc numbers; the table and rationale are in DESIGN.md "Motion" and docs 파운데이션 > 모션.

- Motion marks a **state change** (select, enter, move, load). No ambient/looping decoration, no cursor-following effects on the estimate flow.
- Animate `opacity` and `transform` only. One large flourish (`DURATION.hero`, `SPRING.bouncy`) per screen.
- Read `useReducedMotion()` live (not once at mount): drop translation, keep a `DURATION.instant` fade. CSS animations carry `motion-reduce:animate-none`.
- Anything that loops must pause off-screen. New animated components get a story that shows the motion plus a replay control.
- Do not copy third-party animation component code (React Bits is MIT + Commons Clause and forbids redistribution, which our shadcn registry would be). Re-implement against our tokens instead.

Before implementing Motion APIs, invoke the `motion-react` skill and fetch official docs via `https://motion.dev/llms.txt`.

Same-element and WebGL-canvas restrictions: see "Rules that are easy to violate" in `CLAUDE.md`. Do not mix GSAP pin and OrbitControls on the same WebGL canvas. If unclear, use AskUserQuestion.

Register GSAP plugins before use; cleanup in `useEffect` / `useGSAP`.
