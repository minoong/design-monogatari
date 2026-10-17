<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## design-monogatari web

Next.js estimate app (port **3000**). FSD in `src/` (`_app` + `_pages/estimate`). Next `app/` only re-exports. UI from `@repo/ui/*`. Theme: `next-themes` + `html.light` / `html.dark`. The home route is the estimate wizard: `src/_pages/estimate/ui/` (server page decodes the URL, client `EstimateApp` runs the steps, price bar, summary and the confirm / blocked / suggestion dialogs). The estimate rules live in `src/_pages/estimate/model/` as pure TypeScript (catalog data, `resolveSelection`, `calculateQuote`, URL codec, and the wizard reducer `wizard.ts` that turns resolutions into screen state) with vitest tests (`pnpm --filter web test`); rule `.claude/rules/estimate-domain.md`. The 3D car (`ui/vehicle-stage.tsx` → lazy `ui/vehicle-viewer.tsx` via `next/dynamic` `ssr: false`, from `@repo/vehicle-3d/viewer`) repaints with the selected exterior colour and follows the selected wheel size (19/20/21in via `model/wheel-map.ts`); the interior colour (`model/interior-map.ts`) recolours seats, doors, headliner and pillars to a similar colour; garnish and seat layout are not modelled. The sunroof shows only when `model/roof-map.ts` `hasSunroof` is true (the 파노라마 선루프 or 스카이 라운지 루프 package is in the selection); otherwise the opening is closed. The camera follows the step (`model/stage-view.ts`: 휠 step → front wheel close-up, 시트 → cabin looking back, 내장 → driver's-eye dashboard, others → exterior) with view buttons under the stage for a manual pick that lasts only for that step; inside views have no zoom and show an overlay saying the interior is the model default (presets and limits: `packages/vehicle-3d/AGENTS.md` Camera views). It shows a skeleton while loading and a colour dot with a message when WebGL or the model is unavailable. 3D assets: `public/models/g05-web/*.glb` (optimized X5 parts, no emblem) + `public/models/studio.hdr`; terms in the root `NOTICE`.

Skill: `.agents/skills/feature-sliced-design/SKILL.md`. Rule: `.claude/rules/fsd-apps.md`.

After UI or token changes, do not wait to be asked: `ui-verifier` subagent (Storybook light/dark), then `pnpm verify`. See root `AGENTS.md` and `.claude/agents/ui-verifier.md`.
