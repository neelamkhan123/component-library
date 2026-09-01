export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/** Turns "Dialog"/"DateRangePicker" into a readable label. */
export function humanize(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

/**
 * Collapses the URL shapes a static export can be served under to the one
 * form the nav registry uses. A host may hand back `/docs/button`,
 * `/docs/button/`, or `/docs/button.html` for the same page, and an
 * equality check against `href` has to survive all three — otherwise the
 * active link and the previous/next pager silently disagree with the
 * prerendered markup, which surfaces as a hydration mismatch.
 */
export function normalizePath(pathname: string): string {
  const cleaned = pathname
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned;
}
