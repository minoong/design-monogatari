import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    // JSX 안에 `//` 주석을 그대로 쓰면 주석이 아니라 화면에 찍히는 글자가 된다(`pnpm verify`가 유효한 코드로 보고 통과시킨다).
    // `{/* ... */}`를 쓰거나 `return` 위로 옮긴다. 새 의존성 없이 내장 규칙으로 막는다.
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/^\\s*\\/\\//]',
          message:
            'JSX 안의 `//`는 주석이 아니라 화면에 보이는 글자입니다. `{/* ... */}`를 쓰십시오.',
        },
      ],
    },
  },
  {
    ignores: ['dist/**'],
  },
];
