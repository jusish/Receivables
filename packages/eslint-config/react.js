module.exports = {
  extends: ['./index.js'],
  env: {
    browser: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
