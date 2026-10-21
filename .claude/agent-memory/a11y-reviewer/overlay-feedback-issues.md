---
name: overlay-feedback-issues
description: Recurring problems in Toast/Sheet/Notice/ChangeDiff style components (live regions, modal inertness, timers)
metadata:
  type: project
---

- Toast viewport is rendered inline (not portaled); Radix modal Dialog/Sheet aria-hides siblings and traps focus, so toasts fired from inside a dialog are silent and unreachable by keyboard.
- Focusable container with `outline-none` and no ring (toast viewport, tabIndex -1) fails 2.4.7; check every tabIndex=-1 target.
- Timer pause/resume via onPointerLeave/onBlur calling start() without a guard or reason set leaks timers and resumes while still hovered/focused; React onBlur bubbles between children.
- aria-live on a container with buttons announces button names too (noisy); mirror title+description in an sr-only live region instead.
- `list-none` ol needs `role="list"` (also seen in Stepper).
- role=status inserted with content on mount is not reliably announced; docs overclaim "나중에 나타날 때 읽힙니다".
- Sheet (handle default true): panel is `touch-none overflow-hidden`, so long content outside SheetBody is clipped with no wheel/touch scroll; touch-none/touch-pan-y also block pinch-zoom (use touch-pinch-zoom); snap heights: only drag changes height, focus into clipped/off-screen part is not auto-expanded; SheetBody has no tabindex/ring (Safari cannot keyboard-scroll text-only body); handle bg-muted-foreground/50 is ~2:1 light.
- Live status inserted while a Radix modal is exiting is lost (aria-hidden others stays until unmount): StageNotice after accept-suggestion / blocked-dialog alt-trim.
- Tables with table-fixed inside overflow-hidden wrappers clip long unbroken text instead of scrolling; add wrap-break-word to th too.
