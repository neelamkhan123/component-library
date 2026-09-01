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
          // The jest-axe passes are CPU-bound, and this project runs 92 files
          // in parallel, so their wall-clock time depends heavily on how much
          // CPU they actually get. DateRangePicker's axe test — two full
          // calendar grids, so several hundred nodes — measures ~1.1s run on
          // its own but 5.2s to 6.1s under a loaded suite, which straddles the
          // 5s default and fails the run perhaps half the time. The work is
          // legitimate rather than hung, so the budget is the thing that is
          // wrong; 20s leaves room for a slower runner while still surfacing a
          // genuine hang in reasonable time.
          testTimeout: 20_000,
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: [path.join(dirname, "vitest.setup.ts")],
        },
      },
    ],
  },
});
