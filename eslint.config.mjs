import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import tseslint from '@vue/eslint-config-typescript';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts'],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...tseslint(),
  prettier,
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
