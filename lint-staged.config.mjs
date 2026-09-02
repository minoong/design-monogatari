const quoteFiles = (files) => files.map((file) => `"${file}"`).join(' ');

/** @type {import('lint-staged').Configuration} */
export default {
  'packages/ui/**/*.{ts,tsx,js,mjs}': [
    'prettier --write',
    (files) => `pnpm --filter @repo/ui exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  'apps/web/**/*.{ts,tsx,js}': [
    'prettier --write',
    (files) => `pnpm --filter web exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  'apps/docs/**/*.{ts,tsx,js}': [
    'prettier --write',
    (files) => `pnpm --filter docs exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  'packages/eslint-config/**/*.js': [
    'prettier --write',
    (files) =>
      `pnpm --filter @repo/eslint-config exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  '*.{json,md,css}': 'prettier --write',
};
