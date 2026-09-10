<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## design-monogatari web

Next.js demo (port **3000**). UI from `@repo/ui/*`. Theme: `next-themes` + `html.light` / `html.dark`. Home is the estimate demo.

After UI or token changes, do not wait to be asked: Playwright Storybook light/dark, then `pnpm verify`. See root `AGENTS.md` and `.cursor/agents/ui-verifier.md`.
