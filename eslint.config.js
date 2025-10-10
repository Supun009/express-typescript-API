import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  // Global ignores
  {
    ignores: ["dist/", "node_modules/", "logs/"],
  },

  // Base config for all JS/TS files
  js.configs.recommended,

  // TypeScript specific configuration
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Your existing strict rules
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],

      // Rules from typescript-eslint
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // Rules to manage unused imports and variables
      "@typescript-eslint/no-unused-vars": "off", // Disable base rule
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
      ],

      // Relaxed rules for tests if needed
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
    },
  },

  // Configuration for JS/TS config files
  {
    files: ["*.js", "*.ts"],
    rules: {
        "indent": ["error", 2],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "no-trailing-spaces": "error",
        "object-curly-spacing": ["error", "always"],
    }
  }
);