---
paths:
  - 'apps/web/src/**/estimate/**'
---

# Estimate domain (apps/web)

The car-estimate logic is a pure TypeScript model, separate from React.

- **Money is an integer number of KRW.** No floats, no string math. Format only at the edge (`formatWon`). Rounding rules live in one place and are covered by tests.
- **All rules and prices live in `model/`**: catalog data, `resolveSelection`, `calculateQuote`, URL codec. No React, no `window`, no `'use client'` in `model/`. UI renders what the model returns (including its `effects`: auto-added, auto-removed, replaced, remapped, blocked, suggestion, unavailable-reason).
- **Rules are data, not `if` chains.** A new constraint is a new entry in the catalog's rule declarations plus a test, not a branch in a component.
- **Never silently change a selection.** Any automatic add/remove/remap must come back as an effect the UI shows.
- **State lives in the URL.** Every selection round-trips through the codec (`decode(encode(x))` equals `x`); invalid input falls back to defaults and reports it.
- **Tests are required** for price sums, every rule kind, remapping, the URL codec, and invalid input. The catalog is fictional and the page says so ("비공식 포트폴리오, BMW와 무관"); do not present real BMW prices or specs as fact.
