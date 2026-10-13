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
- overflow-x-auto lists with `p-0` clip the 2px+2px-offset focus outline (overflow-y computes to auto); add padding or inset outline (Stepper).
- `list-none` ol/ul loses list semantics in Safari/VoiceOver unless `role="list"`; docs then overclaim "목록 N개 항목".
- `scrollbar-none` is not a Tailwind 4.3 utility (no match in lib.js); only the `::-webkit-scrollbar` arbitrary variant actually hides it.
- Two `in-*:` variants (current vs completed) on one element can fight over bg/text colour; check combined states.
- Docs 접근성 sections tend to overclaim SR wording ("사용할 수 없음을 읽어요") and omit announced-content gaps.
