---
name: vehicle-stage-issues
description: Recurring a11y gaps around the 3D stage (apps/web vehicle-stage, packages/vehicle-3d, Storybook overlay)
metadata:
  type: project
---

- Canvas is aria-hidden and OrbitControls has no keyboard path: exterior orbit is drag-only, only preset 시점 buttons exist (2.1.1 / 2.5.7).
- role="status" notes are conditionally mounted (inserted with content), so SRs often miss them; mount the region always.
- Button disabled uses `disabled:opacity-40` (button.tsx), not bg-muted; disabled zoom gives no inline reason.
- aria-label that drops the visible text breaks Label in Name (e.g. "처음 시점" vs "이 시점의 처음 위치로").
- Storybook overlay panels use `bg-background/55` + text-muted-foreground over the scene: contrast not guaranteed.
- OptionRow keeps unavailable radios enabled with aria-disabled; arrowing onto one fires onChange (dialog) - check each time.

- Rotate/zoom buttons are `hidden lg:flex` (display:none): narrow viewport incl. 200-400% zoom on desktop loses them; gate on pointer:coarse, not width. Save-image button disabled gives no reason.

Resolved (chore/review-3d-controls): rotate buttons (rotateBy) are the non-drag alternative; the sr-only role=status is always mounted and says the current view; "처음 시점" has no aria-label; arrow-key navigation over unavailable option rows no longer opens the dialog (only Space/click does); the Storybook overlay panel is bg-background/95; pressed+focus-visible on a secondary Button gets a ring with an offset. Still open: Button disabled uses opacity (DS-wide); focus after closing the wizard dialog goes to the step heading, not the row.
