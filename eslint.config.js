const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  globalIgnores(["dist/*", "node_modules/*", ".expo/*"]),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    files: ["__tests__/**/*", "setupTests.*", "__mocks__/**/*"],
    languageOptions: {
      globals: {
        jest: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        test: "readonly",
      },
    },
  },
]);
