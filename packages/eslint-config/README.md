# `@repo/eslint-config`

Shared [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files) for the monorepo.

## Exports

| Import                               | Use                                                                |
| ------------------------------------ | ------------------------------------------------------------------ |
| `@repo/eslint-config/base`           | JS/TS baseline (turbo, import sort, typescript-eslint recommended) |
| `@repo/eslint-config/react-internal` | React libraries (`@repo/ui`)                                       |
| `@repo/eslint-config/next-js`        | Next.js apps                                                       |
| `@repo/eslint-config/tailwind`       | `withTailwindCss(configs, cssConfigPath)` helper                   |

## Tailwind ESLint

Wrap package config with `withTailwindCss` and the CSS entry **relative to that package's cwd**:

```js
import { config } from '@repo/eslint-config/react-internal';
import { withTailwindCss } from '@repo/eslint-config/tailwind';

export default withTailwindCss(config, './src/styles/globals.css');
```

- `@repo/ui`: `./src/styles/globals.css`
- Next apps: `./app/globals.css`

`tailwindcss/classnames-order` is off — Prettier plugin handles class order.

## Lint

```bash
pnpm --filter @repo/eslint-config lint
```
