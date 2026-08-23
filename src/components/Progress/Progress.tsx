import { forwardRef, type HTMLAttributes } from "react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress, from `0` to `max`. Omitted (or `undefined`) renders an indeterminate/loading bar instead. */
  value?: number;
  /** The value that represents 100% complete. Defaults to `100`. */
  max?: number;
}

/**
 * A progress bar: a track with a filled portion showing how far along
 * something is. Rendered as a plain `<div role="progressbar">` pair rather
 * than the native `<progress>` element — unlike `Switch`/`Checkbox`, where
 * the native input already looks right once its own box is styled,
 * `<progress>`'s fill is drawn inside vendor-prefixed pseudo-elements
 * (`::-webkit-progress-value`, `::-moz-progress-bar`) that render
 * inconsistently across engines and can't be reached with a plain Tailwind
 * class, so a track `<div>` with a width-driven fill `<div>` inside it is
 * the one that can actually be styled consistently. See `DECISIONS.md`.
 *
 * A `progressbar` has no name from content the way a `<button>` does, so
 * pass `aria-label` (or `aria-labelledby`) saying what is progressing —
 * without one, axe flags `aria-progressbar-name` and a screen reader
 * announces a bare percentage with nothing to attach it to.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className, ...props }, ref) => {
    const clamped = value === undefined ? undefined : Math.min(Math.max(value, 0), max);
    const percent = clamped === undefined ? undefined : (clamped / max) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        className={mergeClassNames(
          "h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
          className,
        )}
        {...props}
      >
        <div
          className={mergeClassNames(
            "h-full rounded-full bg-slate-950 dark:bg-white",
            percent === undefined
              ? "w-full animate-pulse motion-reduce:animate-none"
              : "transition-[width] duration-300 ease-out motion-reduce:transition-none",
          )}
          style={percent === undefined ? undefined : { width: `${percent}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";
