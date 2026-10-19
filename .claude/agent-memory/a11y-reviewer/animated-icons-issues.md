---
name: animated-icons-issues
description: Pitfalls after animated icons (IconFrame span wrapper) replaced bare svgs
metadata:
  type: project
---

- IconFrame renders span>svg, so parent CSS selectors like `[&>svg]` (package-row.tsx checkbox box) no longer match; check them whenever an svg is swapped for an animated icon.
- Button.withIconHover clones isHovered onto every non-DOM child (incl. through fragments), overriding an explicit `isHovered` on CheckIcon in CopyButton iconOnly.
- Reduced motion is gated centrally in icons/use-animated-icon.ts (play + hover); icons themselves are aria-hidden via IconFrame.
