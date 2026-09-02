import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';

/**
 * @param {import('eslint').Linter.Config[]} configs
 * @param {string} cssConfigPath Path to Tailwind CSS entry, relative to eslint cwd
 * @returns {import('eslint').Linter.Config[]}
 */
export function withTailwindCss(configs, cssConfigPath) {
  const tailwindRecommended =
    eslintPluginTailwindcss.configs['flat/recommended'] ??
    eslintPluginTailwindcss.configs.recommended;

  return [
    ...configs,
    tailwindRecommended,
    {
      settings: {
        tailwindcss: {
          cssConfigPath,
          tailwindFunctions: ['cn', 'clsx', 'cva'],
        },
      },
      rules: {
        'tailwindcss/classnames-order': 'off',
      },
    },
  ];
}
