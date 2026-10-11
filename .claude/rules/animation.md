---
paths:
  - 'packages/ui/**/*.{ts,tsx}'
  - 'apps/**/*.{ts,tsx}'
---

# Animation

| Use case                                    | Tool                            | Skill                                         |
| ------------------------------------------- | ------------------------------- | --------------------------------------------- |
| Hover, enter/exit, layout UI motion         | Motion (`motion/react`, active) | `motion-react`, `fixing-motion-performance`   |
| Scroll-linked, pin, scrub, complex timeline | GSAP + ScrollTrigger            | `gsap-scrolltrigger`, `gsap-timeline`         |
| React integration                           | GSAP in components              | `gsap-react`                                  |
| Performance                                 | transforms, avoid layout thrash | `gsap-performance`                            |
| Storybook 3D paint (pin + yaw)              | GSAP + ScrollTrigger            | `gsap-scrolltrigger`, `packages/ui/AGENTS.md` |
| Storybook 3D OEM inspect                    | Three `OrbitControls`           | `packages/ui/AGENTS.md`                       |

Before implementing Motion APIs, invoke the `motion-react` skill and fetch official docs via `https://motion.dev/llms.txt`.

Do not mix GSAP and Motion on the same element without reason. Do not mix GSAP pin and OrbitControls on the same WebGL canvas. Do not put Motion on a WebGL canvas. If unclear, use AskUserQuestion.

Register GSAP plugins before use; cleanup in `useEffect` / `useGSAP`.
