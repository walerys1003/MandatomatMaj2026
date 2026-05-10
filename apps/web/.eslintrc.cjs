module.exports = {
  root: true,
  extends: ['@mandatomat/config/eslint-next'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@next/next/no-html-link-for-pages': ['error', './src/app'],
  },
}
