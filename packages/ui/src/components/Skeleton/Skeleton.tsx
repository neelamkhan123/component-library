import { forwardRef, type HTMLAttributes } from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * A pulsing placeholder standing in for content that hasn't loaded yet.
 * Renders a plain `<div>` with no default size — a text line, an avatar
 * circle, and a card block are all shaped completely differently, so
 * guessing a default would be wrong as often as it's right; size every
 * instance with `className` (e.g. `h-4 w-32` for a line, `h-10 w-10
 * rounded-full` for an avatar).
 *
 * `aria-hidden`, always: a skeleton is a visual stand-in with nothing for
 * assistive tech to read, the same treatment `BreadcrumbSeparator` and
 * `CarouselDots`' own decorative marks get. That intentionally leaves
 * announcing the *loading* state itself unhandled here — a screen a caller
 * fills with several `Skeleton`s should wrap them in one `role="status"`
 * region with a single accessible label (e.g. `aria-label="Loading"`), not
 * have every individual skeleton announce redundantly on its own, and only
 * the caller knows how many there'll be or what the loading region as a
 * whole represents.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={mergeClassNames("animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none dark:bg-slate-800", className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";
