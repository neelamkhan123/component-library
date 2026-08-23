import React from "react";
import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import { lightTheme, darkTheme } from "./theme";

/**
 * The manager chrome (sidebar/toolbar) picks up its theme from
 * `addons.setConfig()` in manager.ts — but a Docs page's actual article
 * content (headings, prose, the props table) renders inside the *preview*
 * iframe via addon-docs' own `DocsContainer`, which is themed completely
 * separately and defaults to light regardless of the manager. This reads
 * the same `theme` global the canvas decorator uses (see preview.tsx) so
 * the docs article matches too.
 */
export const ThemedDocsContainer = ({ children, context }: DocsContainerProps) => {
  const theme = context.store.userGlobals.get().theme === "dark" ? darkTheme : lightTheme;

  return (
    <DocsContainer context={context} theme={theme}>
      {children}
    </DocsContainer>
  );
};
