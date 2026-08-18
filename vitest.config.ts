import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // Force esbuild pre-bundling of CJS deps whose named/default exports
  // aren't resolved correctly when served directly to the browser runner.
  optimizeDeps: {
    include: [
      "aria-query",
      "lz-string",
      "@testing-library/jest-dom/vitest",
      "pretty-format",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        test: {
          // The jsdom-based `*.test.tsx` unit/a11y tests sitting next to every
          // component — distinct from the Storybook/Chromium project above,
          // which only picks up `*.stories.tsx`. This was scaffolded commented
          // out and never turned back on, so none of these files were actually
          // running under `npm test`; every component's `*.test.tsx` is real
          // and was passing when run directly, just never wired into the
          // default test command until now.
          name: "unit",
          environment: "jsdom",
          // `@testing-library/react`'s auto-cleanup between tests only
          // registers itself when it can see a global `afterEach` — without
          // this, every test in a file keeps rendering into the same
          // `document.body` on top of the last, so later tests in a file
          // fail with "found multiple elements" for markup earlier tests
          // left behind.
          globals: true,
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: [path.join(dirname, "vitest.setup.ts")],
        },
      },
    ],
  },
});
