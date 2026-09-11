# @repo/ui Agent Instructions

React design system package (Just-in-Time — no `build` script).

## Conventions

- One component per file: `src/button.tsx` → import `@repo/ui/button`
- **Named exports** only; no barrel `index.ts`
- `"use client"` only when needed (event handlers, hooks, Motion, Radix)
- **Styling**: Tailwind utility classes; merge with `./lib/cn`
- **Design language**: root `DESIGN.md` — read before UI changes
- **Design tokens**: `@theme` in `src/styles/globals.css` (keep in sync with DESIGN.md)
- **Monorepo import**: `@repo/ui/<name>` — **Registry export**: `registry/design-monogatari/` + `registry.json` for `shadcn add` (`bg-background`, `text-foreground`, …)
- Reference: @packages/ui/src/button.tsx (variants / `asChild`), @packages/ui/src/dialog.tsx (compound)

## Composition patterns

This package is a design system, not FSD. Pick a pattern by API surface, then copy the referenced file. Do not invent a new public API style.

| When                                        | Pattern                                                           | Reference                                              | Do not                                                  |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| One control, visual variants                | Props + CVA (`variant` / `size` / `radius`)                       | @packages/ui/src/button.tsx                            | Boolean soup (`isPrimary` + `isLarge` + `isPill`)       |
| Same control, stricter a11y                 | Thin wrapper, named export                                        | @packages/ui/src/icon-button.tsx                       | Guess icon-only from child count                        |
| Trigger + content + header/footer           | Compound: `Root` + parts, same file, shared context               | @packages/ui/src/dialog.tsx                            | Render props; one mega-component with 12 layout props   |
| Label + control + error                     | Compound: `Field` + `FieldLabel` + `FieldError`                   | @packages/ui/src/field.tsx                             | Unlabeled inputs; error text without `aria-describedby` |
| Grouped surface                             | Compound: `Card` + `CardHeader` + `CardTitle` + `CardDescription` | @packages/ui/src/card.tsx                              | Demo link cards with required `href` / UTM              |
| Render as another element (`<a>`, `<Link>`) | `asChild` + Radix `Slot`                                          | `Button asChild`, Dialog trigger/close                 | `as="a"` unions; `children` as function                 |
| Form primitive                              | Wrap native or Radix, forward ref                                 | @packages/ui/src/input.tsx, @packages/ui/src/label.tsx | Reimplement labelling without Radix `Label`             |

**Compound (Dialog):** `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` — consumers compose JSX; parts share open state via context. **`DialogTitle` is required** inside `DialogContent`. `DialogContent` already renders overlay — do not add `DialogOverlay` as a sibling.

**Compound (Field):** `Field`, `FieldLabel`, `FieldError`. Pair `htmlFor` / `id` and `aria-describedby` / error `id`. Set `aria-invalid` on the control.

**Compound (Card):** `Card`, `CardHeader`, `CardTitle`, `CardDescription` — hairline surface, no shadow.

**Polymorphism:** `asChild` only. No render-prop public API (`children(props) => …`), no HOCs. `cloneElement` for icon hover inside Button is internal — do not expose it.

**`children`:** composition slot for nodes, not a function. Icon + label: nest in `Button` with `data-icon="inline-start"` \| `"inline-end"`.

New components: `.agents/skills/create-component/SKILL.md`.

## Storybook

```bash
pnpm --filter @repo/ui storybook
```

Stories live next to components: `src/*.stories.tsx`. Foundations: `src/foundations/*.stories.tsx`.
Theme: `@storybook/addon-themes` applies `html.light` / `html.dark` (`withThemeByClassName`).

## Skills when working here

| Task            | Skill                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| New component   | `.agents/skills/create-component/SKILL.md`                                                                  |
| Styling         | `.cursor/rules/styling.mdc`                                                                                 |
| Registry export | `.cursor/rules/shadcn-registry.mdc`                                                                         |
| Composition     | 이 파일 **Composition patterns** + `dialog.tsx` / `button.tsx`                                              |
| React perf      | `.agents/skills/vercel-react-best-practices/SKILL.md`                                                       |
| Accessibility   | `.agents/skills/accessibility/SKILL.md`                                                                     |
| GSAP in React   | `.agents/skills/gsap-react/SKILL.md`                                                                        |
| UI motion       | `.agents/skills/motion-react/SKILL.md`                                                                      |
| Done            | Playwright MCP 라이트/다크(요청 없이) → `.cursor/agents/ui-verifier.md` 또는 ship-ui-change → `pnpm verify` |

## Motion

- Package: `motion` — import `motion/react-client` in client components
- Button: native `<button>` + Radix `Slot`. `radius` `md` | `lg` (default) | `pill`. No hover scale. Press: Motion `whileTap` (0.96, IconButton 0.9). Primary uses black dimmer; secondary/clear use a light foreground wash. lucide-animated icons may animate on button hover. Icon-only: `IconButton` with required `aria-label`, default `radius="md"`.
- Dialog: overlay/content enter via Motion
- Do not combine `transition-*` Tailwind with Motion on the same element
- Respect `useReducedMotion()`
