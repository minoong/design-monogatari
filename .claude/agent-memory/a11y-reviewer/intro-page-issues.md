---
name: intro-page-issues
description: apps/web intro page (/) a11y findings from first review; patterns likely to recur in web screens
metadata:
  type: project
---

- role="img" wrapping the 3D stage also wraps fallback text, skeleton label and inside-view note (children of role=img are presentational, so SR loses them). Keep text outside the img.
- Sticky stage block sits outside any landmark (between header and main); PriceBarTotal live region lives in it and is `hidden` below `split`, so no price announcement on mobile.
- ColorSwatchGroup `onValueChange` has no arrow-key guard (IntroChoiceGroup has one), so arrow-walking unavailable swatches fires a notice per step.
- Repeating an identical blocked choice sets the same text into role="status" and is not re-announced.
- vehicle-3d `prefersReducedMotion()` (inspect-controls.tsx goTo) makes camera view change instant; viewer reads it live.
- Focus rings via `ring-2 focus-visible:outline-none` (footer summary) vanish in forced-colors.
