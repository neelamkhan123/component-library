import { create } from "storybook/theming";

/**
 * Manager (chrome) themes built from the same Tailwind slate palette the
 * components themselves use for dark mode (see the decorator in
 * preview.tsx: `bg-white text-slate-950` / `dark:bg-slate-950 dark:text-white`,
 * and e.g. Accordion's `border-slate-200 dark:border-slate-800`) — so the
 * sidebar/toolbar match the canvas instead of Storybook's stock palette.
 */

const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
};

export const lightTheme = create({
  base: "light",
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: slate[200],
  barBg: "#ffffff",
  barTextColor: slate[500],
  barHoverColor: slate[900],
  barSelectedColor: "#020617",
  textColor: "#020617",
  textMutedColor: slate[500],
  inputBg: "#ffffff",
  inputBorder: slate[200],
  inputTextColor: "#020617",
  buttonBg: slate[100],
  buttonBorder: slate[200],
});

export const darkTheme = create({
  base: "dark",
  appBg: slate[950],
  appContentBg: slate[950],
  appPreviewBg: slate[950],
  appBorderColor: slate[800],
  barBg: slate[950],
  barTextColor: slate[400],
  barHoverColor: slate[300],
  barSelectedColor: "#ffffff",
  textColor: "#ffffff",
  textMutedColor: slate[400],
  inputBg: slate[900],
  inputBorder: slate[800],
  inputTextColor: "#ffffff",
  buttonBg: slate[900],
  buttonBorder: slate[800],
});
