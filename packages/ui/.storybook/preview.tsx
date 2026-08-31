import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import { ThemedDocsContainer } from "./ThemedDocsContainer";

const preview: Preview = {
  // The Light/Dark toggle itself lives in manager.ts as a custom toolbar
  // tool (ThemeToggle) rather than here. A `globalTypes` entry with a
  // `toolbar` config makes Storybook auto-render a group separator before
  // it, and that separator can't be turned off — so the global is declared
  // here (for decorators to read via context.globals.theme) without a
  // `toolbar`, and the actual button is a plain addons.add() tool instead.
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.theme === "dark";

      return (
        <div
          className={[
            "bg-white text-slate-950 transition-colors dark:bg-slate-950 dark:text-white",
            isDark ? "dark" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    options: {
      storySort: {
        method: "alphabetical",
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    // The Docs page's own article (headings, prose, props table) renders
    // in the preview iframe via addon-docs, themed independently of the
    // manager chrome — swap in the same slate palette there too.
    docs: {
      container: ThemedDocsContainer,
    },
  },
};

export default preview;
