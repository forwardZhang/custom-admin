import type { Config } from 'stylelint';

const config: Config = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-recess-order',
  ],
  rules: {
    'selector-class-pattern': null,
    'no-empty-source': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'utility',
          'plugin',
          'source',
          'theme',
          'custom-variant',
          'container',
          'reference',
        ],
      },
    ],
    'custom-property-pattern': null,
    'import-notation': null,
    'property-no-vendor-prefix': null,
  },
};

export default config;
