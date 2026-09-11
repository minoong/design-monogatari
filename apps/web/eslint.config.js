import { nextJsConfig } from '@repo/eslint-config/next-js';
import { withTailwindCss } from '@repo/eslint-config/tailwind';

/** @type {import('eslint').Linter.Config[]} */
export default withTailwindCss(nextJsConfig, './src/_app/styles/globals.css');
