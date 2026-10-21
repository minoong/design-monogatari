# Stack guardrails

## Approved defaults

- Package manager: **pnpm**
- React **19** + TypeScript
- Monorepo: **Turborepo** + workspace packages
- Styling: **Tailwind CSS v4** (active — `@repo/ui/styles.css`, `@source` monorepo)
- UI motion: **Motion** (`motion/react-client` for components, `motion/react` for hooks and `AnimatePresence`)
- Scroll/timeline animation: **GSAP** (+ ScrollTrigger)
- Component docs: **Storybook** (active)
- 3D vehicle: **Three.js** + `@react-three/fiber`, dependencies of `@repo/vehicle-3d` only (not `@repo/ui`, not apps directly)
- Design system: `@repo/ui` internal package

## Before using an alternative

If the task suggests Vue, Svelte, styled-components, CSS-in-js only, npm/yarn, anime.js-only, etc.:

1. **AskUserQuestion** — why the default is insufficient, scope, tradeoffs
2. Read official docs before implementing
3. **Do not add dependencies** to `package.json` without explicit user approval

## Docs

- React: https://react.dev
- GSAP: https://gsap.com/docs/v3/
- Motion: https://motion.dev/docs/react — index: `https://motion.dev/llms.txt`, skill: `motion-react`
- Tailwind: https://tailwindcss.com/docs — shared theme `@repo/ui/styles.css`, rule `.claude/rules/styling.md`
- Storybook: https://storybook.js.org/docs
- Turborepo: `turbo docs "<query>"` or the `turborepo` skill
