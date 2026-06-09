import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Enforce casing of names (not their meaning). Most-general selector
      // first, more-specific ones override it below.
      '@typescript-eslint/naming-convention': [
        'error',
        // Fallback: anything not matched more specifically must be camelCase.
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        // Variables: camelCase, UPPER_CASE for constants, PascalCase for
        // component values assigned to a variable (e.g. const App = () => ...).
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        // Functions: camelCase for normal fns/hooks, PascalCase for React components.
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        // Classes, interfaces, enums, type aliases, type params.
        { selector: 'typeLike', format: ['PascalCase'] },
        // Skip names we don't control (HTTP headers, JSON keys, env vars).
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          format: null,
          modifiers: ['requiresQuotes'],
        },
      ],
    },
  },
  // Keep ESLint out of formatting; Prettier owns that (separate CI job).
  eslintConfigPrettier,
);
