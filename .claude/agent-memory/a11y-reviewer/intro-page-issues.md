---
name: intro-page-issues
description: apps/web intro page (/) a11y findings; first review (full-screen car) plus 2026-11-28 stage+sheet redesign review
metadata:
  type: project
---

- (old design, fixed in the 2026-11-28 redesign) role="img" swallowed fallback text; price status was hidden on mobile. Now the stage keeps text outside role=img and the total role=status is global in IntroApp.
- Repeating an identical blocked choice sets the same text into role="status" (IntroNoticeSlot) and is not re-announced; notices also never clear, so a blocked notice goes stale after the trim changes.
- ColorSwatchGroup/IntroChoiceGroup arrow guard exists (useArrowNavigation) - keep it when adding groups.
- vehicle-3d `prefersReducedMotion()` makes camera view change instant; viewer reads it live. AnimatedAmount uses NumberFlow, TextRoll uses useReducedMotion.
- Redesign: sticky stage is `h-[42svh]` + header 3.5rem; scroll-padding-top mirrors it (globals.css). On short/400% zoom viewports it eats most of the screen (1.4.10, 2.4.12). Suggest `min(42svh, Npx)` in both places.
- Redesign: index/hero `#section` links go through Next Link; sections have no tabIndex=-1, so focus may not move to the target (verify in browser).
- Redesign: focusin -> setActive and window scroll `last` / resize re-observe can override each other (bottom of a tall viewport forces intro-start while focus is in price).
- Footer `outline-hidden focus-visible:ring-2` is Tailwind v4: forced-colors keeps a transparent outline, so the old "vanishes in forced-colors" note is not accurate for v4.
