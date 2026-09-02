import { twMerge, type ClassNameValue } from "tailwind-merge";

/**
 * Joins class names, with the *last* conflicting Tailwind utility winning.
 *
 * A plain `join(" ")` is not enough. Components ship raw utility strings and
 * the consuming app's Tailwind generates the CSS, so a component's default
 * (`h-svh`) and a caller's override (`h-72`) end up as two single-class
 * selectors in the same stylesheet — equal specificity, so the winner is
 * decided by their order in the *generated* stylesheet (which Tailwind sorts
 * alphabetically within a property group), not by their order in the
 * `className` string. That made overrides succeed or fail essentially at
 * random: `px-6` beat a default `px-3`, but `bg-slate-900` silently lost to
 * a default `bg-white`.
 *
 * `twMerge` resolves the conflict at the source instead, dropping the earlier
 * utility so only the caller's class reaches the stylesheet at all.
 */
export function mergeClassNames(...classNames: ClassNameValue[]): string {
  return twMerge(classNames);
}
