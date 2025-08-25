import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [".next"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Enforce ES6+/ES7 style across JS/TS
      "no-var": "error",
      "prefer-const": ["warn", { destructuring: "all" }],
      "prefer-arrow-callback": ["warn", { allowNamedFunctions: false }],
      "arrow-body-style": ["warn", "as-needed"],
      "object-shorthand": ["warn", "always"],
      "prefer-template": "warn",
      "no-useless-concat": "warn",
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "prefer-destructuring": [
        "warn",
        {
          array: true,
          object: true,
        },
        { enforceForRenamedProperties: false }
      ],
      "no-extend-native": "error",
      // Disallow CommonJS in app code
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='require']",
          message: "Use ES module imports instead of require().",
        },
        {
          selector:
            "MemberExpression[object.name='module'][property.name='exports']",
          message: "Use ES module exports instead of module.exports.",
        },
      ],
      "no-duplicate-imports": "warn",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
