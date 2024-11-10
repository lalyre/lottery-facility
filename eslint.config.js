// eslint.config.js
import { Linter } from "eslint";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";


/** @type {Linter.Config} */
export default {
  root: true,
  files: ["./src/**/*.{js,ts,tsx}"],
  parser: parser,
  plugins: {
    "@typescript-eslint": typescriptPlugin,
  },
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    project: "./tsconfig.json",
    sourceType: "module",
  },
  rules: {
    "no-console": "off",
  },
};

