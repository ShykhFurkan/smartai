const baseConfig = require("./base.js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [...baseConfig, ...compat.extends("next/core-web-vitals")];
