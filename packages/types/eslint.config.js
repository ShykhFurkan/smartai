const baseConfig = require("@smarthire/config/eslint/base.js");

module.exports = [
  ...baseConfig,
  {
    ignores: ["node_modules/", "dist/"],
  },
];
