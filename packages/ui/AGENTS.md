# @repo/ui Agent Instructions

React design system package (Just-in-Time — no `build` script).

## Conventions

- One component per file: `src/Button.tsx` → import `@repo/ui/button`
- **Named exports** only; no barrel `index.ts`
- `"use client"` only when needed (event handlers, hooks)
- **Styling**: Tailwind utility classes; merge with `./lib/cn`
- **Design tokens**: `@theme` in @packages/ui/src/styles/globals.css
- **Monorepo import**: `@repo/ui/<name>` — **Registry export**: `registry/design-monogatari/` + `registry.json` for `shadcn add` (`bg-background`, `text-foreground`, …)
- Reference: @packages/ui/src/button.tsx

## Skills when working here

| Task            | Skill                                                    |
| --------------- | -------------------------------------------------------- |
| New component   | `.agents/skills/create-component/SKILL.md`               |
| Styling         | `.cursor/rules/styling.mdc`                              |
| Registry export | `.cursor/rules/shadcn-registry.mdc`                      |
| React patterns  | `.agents/skills/vercel-react-best-practices/SKILL.md`    |
| Accessibility   | `.agents/skills/accessibility/SKILL.md`                  |
| GSAP in React   | `.agents/skills/gsap-react/SKILL.md`                     |
| UI motion       | `.agents/skills/motion-react/SKILL.md`                   |
| Done            | `.agents/skills/ship-ui-change/SKILL.md` → `pnpm verify` |

## Planned (not in repo yet)

- Framer Motion for UI motion
- `.stories.tsx` co-located when Storybook is added
