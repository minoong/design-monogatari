const quoteFiles = (files) => files.map((file) => `"${file}"`).join(' ');

/** @type {import('lint-staged').Configuration} */
export default {
  'packages/ui/**/*.{ts,tsx,js,mjs}': [
    'prettier --write',
    (files) => `pnpm --filter @repo/ui exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  'packages/vehicle-3d/**/*.{ts,tsx,js,mjs}': [
    'prettier --write',
    (files) =>
      `pnpm --filter @repo/vehicle-3d exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  'apps/web/**/*.{ts,tsx,js}': [
    'prettier --write',
    // react-bits(인트로에 설치한 외부 컴포넌트)는 eslint.config.js에서 제외했다. 스테이지된 파일로 넘어와도 "무시됨" 경고로
    // --max-warnings 0이 실패하지 않게 한다.
    (files) =>
      `pnpm --filter web exec eslint --fix --max-warnings 0 --no-warn-ignored ${quoteFiles(files)}`,
  ],
  'apps/docs/**/*.{ts,tsx,js,mjs}': [
    'prettier --write',
    (files) => `pnpm --filter docs exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  'packages/eslint-config/**/*.js': [
    'prettier --write',
    (files) =>
      `pnpm --filter @repo/eslint-config exec eslint --fix --max-warnings 0 ${quoteFiles(files)}`,
  ],
  '*.{json,md,mdx,css}': 'prettier --write',
};
