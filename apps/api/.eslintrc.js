module.exports = {
  extends: ['@receivables/eslint-config/nest'],
  root: true,
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
};
