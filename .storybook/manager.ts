import { addons, types } from "storybook/manager-api";
import { ThemeToggle } from "./ThemeToggle";
import { lightTheme } from "./theme";

addons.setConfig({
  // Matches preview.tsx's `theme` global default ("light"); ThemeToggle
  // swaps this to darkTheme to keep the chrome in sync with the canvas.
  theme: lightTheme,
  toolbar: {
    "storybook/background": { hidden: true },
    "storybook/outline": { hidden: true },
    "open-in-editor": { hidden: true },
  },
});

addons.register("theme-toggle", () => {
  addons.add("theme-toggle", {
    type: types.TOOL,
    title: "Theme",
    match: ({ viewMode }) => !!viewMode?.match(/^(story|docs)$/),
    render: ThemeToggle,
  });
});
