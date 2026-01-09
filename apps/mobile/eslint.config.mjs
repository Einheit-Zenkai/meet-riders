import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'dist/**',
      // The mobile lint script targets TS/TSX; ignore JS config/runtime files.
      '**/*.js',
    ],
  },
  // Keep this intentionally minimal: validate TypeScript/TSX parsing
  // without enforcing a large rule-set for the mobile app yet.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // No lint rules for now (enable incrementally later).
    },
  },
];
