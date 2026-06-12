// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'eslint.config.mjs'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // Make Node and Jest globals known so source/test files don't trip no-undef.
  { languageOptions: { globals: { ...globals.node, ...globals.jest } } },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      // Enforce casing of names (not their meaning). Most-general selector
      // first, more-specific ones override it below.
      '@typescript-eslint/naming-convention': [
        'error',
        // Fallback: anything not matched more specifically must be camelCase.
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Variables: camelCase normally, UPPER_CASE for constants.
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        // Function parameters; leading underscore allowed for "unused on purpose".
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Class/object members.
        {
          selector: 'memberLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        // Classes, interfaces, enums, type aliases, type params.
        { selector: 'typeLike', format: ['PascalCase'] },
        // Skip names we don't control (HTTP headers, JSON keys, env vars).
        // These show up as quoted properties like { 'Content-Type': ... }.
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
