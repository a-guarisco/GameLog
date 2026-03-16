const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  ...expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['**/dist/*', '**/src/_ignore/**/*', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'n/no-missing-import': 'off',
      'import/no-unresolved': 'off',
    },
  },
]);
