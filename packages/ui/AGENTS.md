# @repo/ui Agent Instructions

React design system package (Just-in-Time — no `build` script).

## Conventions

- One component per file: `src/Button.tsx` → import `@repo/ui/button`
- **Named exports** only; no barrel `index.ts`
- `"use client"` only when needed (event handlers, hooks, Motion, Radix)
- **Styling**: Tailwind utility classes; merge with `./lib/cn`
- **Design language**: root `DESIGN.md` — read before UI changes
- **Design tokens**: `@theme` in `src/styles/globals.css` (keep in sync with DESIGN.md)
- **Monorepo import**: `@repo/ui/<name>` — **Registry export**: `registry/design-monogatari/` + `registry.json` for `shadcn add` (`bg-background`, `text-foreground`, …)
- Reference: @packages/ui/src/button.tsx

## Storybook

```bash
pnpm --filter @repo/ui storybook
```

Stories live next to components: `src/*.stories.tsx`. Foundations: `src/foundations/*.stories.tsx`.
Theme: `@storybook/addon-themes` applies `html.light` / `html.dark` (`withThemeByClassName`).

## Skills when working here

| Task            | Skill                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| New component   | `.agents/skills/create-component/SKILL.md`                             |
| Styling         | `.cursor/rules/styling.mdc`                                            |
| Registry export | `.cursor/rules/shadcn-registry.mdc`                                    |
| React patterns  | `.agents/skills/vercel-react-best-practices/SKILL.md`                  |
| Accessibility   | `.agents/skills/accessibility/SKILL.md`                                |
| GSAP in React   | `.agents/skills/gsap-react/SKILL.md`                                   |
| UI motion       | `.agents/skills/motion-react/SKILL.md`                                 |
| Done            | Playwright MCP 라이트/다크(요청 없이) → ship-ui-change → `pnpm verify` |

## Motion

- Package: `motion` — import `motion/react-client` in client components
- Button: native `<button>` + Radix `Slot`. `radius` `md` | `lg` (default) | `pill`. No hover scale. Press: Motion `whileTap` (0.96, IconButton 0.9). Primary uses black dimmer; secondary/clear use a light foreground wash. lucide-animated icons may animate on button hover. Icon-only: `IconButton` with required `aria-label`, default `radius="md"`.
- Dialog: overlay/content enter via Motion
- Do not combine `transition-*` Tailwind with Motion on the same element
- Respect `useReducedMotion()`
