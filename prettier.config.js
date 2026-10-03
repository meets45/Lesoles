export default {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',
  singleAttributePerLine: false,
  overrides: [
    {
      files: '*.liquid',
      options: {
        plugins: ['@shopify/prettier-plugin-liquid'],
        singleQuote: false,
        liquidSingleQuote: false,
        embeddedSingleQuote: true,
        singleLineLinkTags: false,
        indentSchema: true,
        parser: 'liquid-html',
      },
    },
  ],
};
