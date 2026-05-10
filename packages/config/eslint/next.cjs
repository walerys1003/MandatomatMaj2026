/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './react.cjs',
    'next/core-web-vitals',
    'prettier',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
}
