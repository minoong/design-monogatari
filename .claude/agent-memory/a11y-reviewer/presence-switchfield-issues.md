---
name: presence-switchfield-issues
description: Motion usePresence pitfall and SwitchField state-word staleness found in review of Presence/SwitchField
metadata:
  type: project
---

- `usePresence()` (framer-motion 14) registers a child id via `register(id)` on mount; if you never call `safeToRemove`, AnimatePresence never removes the element. Use `useIsPresent()` (or `usePresence(false)`) when only the flag is needed. presence.tsx used `usePresence()` without safeToRemove.
- SwitchField keeps internal `checked` state from onChange; `form.reset()` and programmatic `.checked=` fire no change, so the aria-hidden status word goes stale.
- Label base has `peer-disabled:*` which never matches when the control is a child; wrapper needs `has-disabled:`. `has-disabled:opacity-70` on the whole label violates "disabled = bg-muted/text-muted-foreground, not opacity".
- Docs example toggles (aria-pressed + changing label text) double-encode state.
