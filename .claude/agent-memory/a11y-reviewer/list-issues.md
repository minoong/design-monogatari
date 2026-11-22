---
name: list-issues
description: List/ListItem (listbox) a11y findings (first four fixed before merge); check same patterns in future roving-tabindex components
metadata:
  type: project
---

- List non-selectable `ul` has no `role="list"` and Tailwind preflight sets list-style:none, so Safari/VoiceOver drops list semantics; docs claim plain ul.
- ListBaseProps Omits aria-label/labelledby and only re-adds them in the selectable branch, so a plain List cannot be named by type (story passes aria-label on it).
- aria-disabled option relies on text-muted-foreground only; forced-colors maps it to CanvasText so disabled looks enabled (needs forced-colors:text-[GrayText] or inline reason).
- Roving tabindex via useLayoutEffect on [children]: runs every render (children identity); fine but disabled-focused item loses focus with no recovery.
- Typeahead: Space always selects, so multi-word typeahead is impossible; timer not cleared on unmount.
