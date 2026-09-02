import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist", "storybook-static", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Components take `...props` spreads whose types come from React's own
      // HTMLAttributes, so an unused rest sibling is how a prop is deliberately
      // withheld from the spread rather than a mistake.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx"],
    rules: {
      // Test and story files assert on shapes the compiler can't narrow.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
