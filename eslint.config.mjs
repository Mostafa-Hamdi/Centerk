import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/**
 * RTL guard: physical-direction Tailwind classes (ml-, pr-, left-, text-right …) are banned.
 * Use logical ones instead (ms-, pe-, start-, text-end …).
 */
const physicalDirectionClass =
  '/(^|[\\s:])!?-?(m[lr]|p[lr]|left|right|rounded-[lr]|rounded-[tb][lr]|border-[lr]|scroll-m[lr]|scroll-p[lr])-|(^|[\\s:])(text|float|clear)-(left|right)(\\s|$)/';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      'src/services/generated/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${physicalDirectionClass}]`,
          message: 'Use logical Tailwind classes (ms-/me-/ps-/pe-/start-/end-) for RTL.',
        },
        {
          selector: `TemplateElement[value.raw=${physicalDirectionClass}]`,
          message: 'Use logical Tailwind classes (ms-/me-/ps-/pe-/start-/end-) for RTL.',
        },
      ],
    },
  },
  { files: ['**/*.{js,mjs,cjs}'], ...tseslint.configs.disableTypeChecked },
  prettier,
);
