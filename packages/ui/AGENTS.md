# @repo/ui Agent Instructions

React design system package (Just-in-Time — no `build` script).

## Conventions

- One component per file: `src/Button.tsx` → import `@repo/ui/button`
- **Named exports** only; no barrel `index.ts`
- `"use client"` only when needed (event handlers, hooks)
- Reference: @packages/ui/src/button.tsx

## Skills when working here

| Task           | Skill                                                    |
| -------------- | -------------------------------------------------------- |
| New component  | `.agents/skills/create-component/SKILL.md`               |
| React patterns | `.agents/skills/vercel-react-best-practices/SKILL.md`    |
| Accessibility  | `.agents/skills/accessibility/SKILL.md`                  |
| GSAP in React  | `.agents/skills/gsap-react/SKILL.md`                     |
| Done           | `.agents/skills/ship-ui-change/SKILL.md` → `pnpm verify` |

## Planned stack (not in repo yet)

- Tailwind for styling
- Framer Motion for UI motion
- `.stories.tsx` co-located when Storybook is added
