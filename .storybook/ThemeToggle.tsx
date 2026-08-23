import React, { useEffect } from "react";
import { addons, useGlobals } from "storybook/manager-api";
import { Button } from "storybook/internal/components";
import { SunIcon, MoonIcon } from "@storybook/icons";
import { lightTheme, darkTheme } from "./theme";

/**
 * Light/Dark toggle for the manager toolbar. Registered as a plain
 * `addons.add()` tool (see manager.ts) instead of a `globalTypes.theme.toolbar`
 * entry so Storybook doesn't auto-render a separator before it.
 *
 * Flips both the preview's `theme` global (read by the decorator in
 * preview.tsx) and the manager chrome's own theme, so the whole app —
 * sidebar and toolbar included, not just the story canvas — switches
 * together.
 */
export const ThemeToggle = () => {
  const [globals, updateGlobals] = useGlobals();
  const theme = globals.theme === "dark" ? "dark" : "light";

  // Keyed off the global itself (not the click handler) so the manager
  // chrome stays correct however `theme` changed — a click here, but also
  // a page load with `?globals=theme:dark` already in the URL (a bookmark,
  // a shared link, Storybook restoring the last session).
  useEffect(() => {
    addons.setConfig({ theme: theme === "dark" ? darkTheme : lightTheme });
  }, [theme]);

  const toggle = () => {
    updateGlobals({ theme: theme === "light" ? "dark" : "light" });
  };

  return (
    <Button
      key="theme-toggle"
      variant="ghost"
      padding="small"
      title={theme === "light" ? "Light" : "Dark"}
      ariaLabel={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      onClick={toggle}
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};
