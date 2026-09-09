import { config } from '@repo/eslint-config/react-internal';
import { withTailwindCss } from '@repo/eslint-config/tailwind';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['storybook-static/**'],
  },
  ...withTailwindCss(config, './src/styles/globals.css'),
  {
    files: ['src/lib/cn.ts'],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
    },
  },
];
