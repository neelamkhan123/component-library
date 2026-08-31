import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | undefined;

/**
 * One highlighter for the whole static build. Creating a fresh one per code
 * block re-loads and re-parses every grammar and theme, which turns a 46-page
 * export into a multi-minute build.
 */
function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["github-light-default", "github-dark-default"],
    langs: ["tsx", "ts", "jsx", "js", "bash", "json", "css", "html", "diff"],
  });
  return highlighterPromise;
}

export async function highlight(code: string, lang = "tsx"): Promise<string> {
  const highlighter = await getHighlighter();
  const loaded = highlighter.getLoadedLanguages();
  return highlighter.codeToHtml(code.trim(), {
    lang: loaded.includes(lang as never) ? lang : "text",
    themes: { light: "github-light-default", dark: "github-dark-default" },
    // Emits both palettes as CSS variables on each token instead of baking
    // one in, so the theme toggle needs no re-highlight on the client.
    defaultColor: false,
    cssVariablePrefix: "--shiki-",
  });
}
