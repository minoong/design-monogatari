---
name: segmented-issues
description: Segmented control a11y findings (forced-colors underline, pill border 1.4:1, aria-label not typed)
metadata:
  type: project
---

- Selection indicators made only of `bg-*` (Segmented underline `bg-primary`) vanish in forced-colors; borders survive, box-shadow (ring-1) does not. Add `forced-colors:bg-[Highlight]`.
- Pill `bg-background border-border` on `bg-muted` is 1.09:1 fill / 1.38:1 border light, 1.1 / 1.64 dark (fails 1.4.11); `border-muted-foreground` passes both (4.66 / 8.9). Dark selected-vs-unselected text is only 1.79:1.
- `disabled` uses `opacity-50` (repo rule says muted tokens) and `hover:text-foreground` still applies to disabled labels.
- Radiogroup name is optional via HTMLAttributes; IconButton precedent: type the requirement (aria-label | aria-labelledby union).
- Computed values: light muted-foreground #6e6e73 on muted #f5f5f7 = 4.66:1; dark #b2b3bd on #121315 = 8.9:1; primary dark #003cff on #000 = 3.09:1.
