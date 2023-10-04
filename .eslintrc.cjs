// eslint-disable-next-line no-undef
module.exports = {
  extends: [
    // add more generic rule sets here, such as:
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:svelte/recommended",
    "plugin:svelte/prettier",
  ],
  ignorePatterns: ["dist/**/*", "build/**/*", "**/*.html", "**/*.md"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // ...
    project: "tsconfig.json",
    extraFileExtensions: [".svelte"], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
  },
  overrides: [
    {
      files: ["src/**/*.ts"],
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    {
      files: ["src/**/*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
    // ...
  ],
  plugins: ["@typescript-eslint", "prettier", "simple-import-sort"],
  rules: {
    // unused import
    "@typescript-eslint/no-unused-vars": 1,
    "prettier/prettier": 2, // Means error
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  env: {
    browser: true,
    node: true,
  },

  globals: {
    DEFAULT_JS: true,
    DEFAULT_TS: true,
    DEFAULT_RUST: true,
  },
};
