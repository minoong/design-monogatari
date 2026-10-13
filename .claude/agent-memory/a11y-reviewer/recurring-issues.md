---
name: recurring-a11y-issues
description: Recurring accessibility problems seen in @repo/ui selection components (sr-only inputs, Radix accordion ids, price announcement)
metadata:
  type: project
---

- Price/status text sits outside aria-labelledby/describedby on sr-only input rows (OptionRow, PackageRow, ColorSwatchGroup caption), so screen readers never hear price. Check each new row component.
- Radix AccordionTrigger: a custom `id` overrides itemContext.triggerId, so AccordionContent's `aria-labelledby` points at a dead id. Pass `aria-labelledby={ourTriggerId}` on Content too.
- Tailwind v4 `outline-none` is outline-style:none, so `ring-*` focus indicators vanish in forced-colors. Prefer `outline-hidden`.
- Hover/focus-only captions for unavailable options (ColorSwatchGroup) fail the "reason not hover-only" rule on touch; add a persistent hint.
- Decorative strike lines using `bg-foreground` can vanish on swatches of similar colour; needs a two-tone line.
- Docs 접근성 sections tend to overclaim SR wording ("사용할 수 없음을 읽어요") and omit announced-content gaps.
