import type { Config } from 'stylelint';

const config: Config = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-recess-order',
  ],
  plugins: ['stylelint-less'],
  rules: {
    'selector-class-pattern': null,
    'no-empty-source': null,
  },
};

export default config;
