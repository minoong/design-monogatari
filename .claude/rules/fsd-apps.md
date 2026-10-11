---
paths:
  - 'apps/web/**'
  - 'apps/docs/**'
---

# FSD (apps only)

Invoke the `feature-sliced-design` skill. Unsure? `WebFetch` https://fsd.how/llms-small.txt — do not copy docs into the repo.

- **Scope**: `apps/web`, `apps/docs` only. `@repo/ui` is the design system (monorepo `shared/ui`). Do not slice it.
- **Imports**: `import { Button } from '@repo/ui/button'` — no barrels, no wrapping every primitive in `src/shared/ui`
- **Next `app/`**: route files re-export from `@/_app` and `@/_pages/*` only (Next forbids both `app/` and `src/app/`; official skill uses `_app` / `_pages`)
- **Layers**: start with `src/_app` + `src/_pages`. Do not add empty `features/`, `entities/`, `widgets/`
- **widgets**: do not use
- **Alias**: `@/*` → `./src/*`
