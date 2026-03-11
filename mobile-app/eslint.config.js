const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'src/_ignore/**/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      react: {
        version: 'detect',
      },
      'import/core-modules': ['@env'],
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'n/no-missing-import': 'off',
    },
  },
]);
