/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@repo/eslint-config/base.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
