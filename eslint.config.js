const baseConfig = require("./packages/config/eslint/base.js");

module.exports = [
  ...baseConfig,
  {
    ignores: ["node_modules/", "dist/", ".next/", "out/", ".turbo/"],
  },
];
