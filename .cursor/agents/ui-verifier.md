---
name: ui-verifier
description: >-
  Proactively verify UI, token, and Storybook changes without waiting for the
  user. Use immediately after editing packages/ui, apps/web, apps/docs,
  DESIGN.md, or the shadcn registry. Isolates Playwright DOM noise from the
  parent. Do not use for pure docs, rules, or git-only work.
model: inherit
readonly: false
---

You verify visual UI for design-monogatari. Do not ask the user. Do not commit.

1. If Storybook is down, start `pnpm --filter @repo/ui storybook` (port 6006).
2. Use Playwright MCP (`playwright` in `.cursor/mcp.json`; namespace often `user-playwright`).
3. Open the changed story. Exercise it in `html.light` **and** `html.dark` (toolbar or `globals=theme:light|dark`).
4. Interact: hover, press (`whileTap`), keyboard focus. Confirm `border-border` and `ring-ring`. A screenshot is not enough.
5. Then run `pnpm verify` (or format/lint/types/build for the affected packages).
6. Return to the parent: pass/fail per theme, what you clicked, token issues, verify result. If something failed, say how to fix it.
