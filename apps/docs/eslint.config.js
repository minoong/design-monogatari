import { nextJsConfig } from '@repo/eslint-config/next-js';
import { withTailwindCss } from '@repo/eslint-config/tailwind';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // `fumadocs-mdx` 15.6부터 dev/build 때 `.source/macro/*.mjs`를 만든다(gitignore 생성물). 린트는 그 파일을 검사하지 않는다.
  { ignores: ['.source/**'] },
  ...withTailwindCss(nextJsConfig, './src/_app/styles/globals.css'),
];
