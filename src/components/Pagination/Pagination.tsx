import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export type PaginationRangeItem = number | "ellipsis";

export interface GetPaginationRangeOptions {
  /** The current page, 1-indexed. */
  currentPage: number;
  totalPages: number;
  /** How many page numbers to show on each side of the current page. Defaults to `1`. */
  siblingCount?: number;
}

/**
 * Computes which page numbers to render — and where runs of skipped pages
 * collapse into `"ellipsis"` — for a given current page, e.g.
 * `[1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 20]`. `Pagination` is
 * otherwise deliberately presentational (see its docs below): a caller
 * already has `currentPage`/`totalPages` from wherever its data comes
 * from, and rendering `PaginationLink`s from an array is a plain `.map`.
 * This one piece — getting the boundaries right so the range doesn't
 * flicker between "1 2 3 ellipsis 3" and similar off-by-one glitches near
 * the edges — is common enough to get subtly wrong that it's worth
 * providing rather than leaving to every consumer to re-derive.
 */
export function getPaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: GetPaginationRangeOptions): PaginationRangeItem[] {
  if (totalPages <= 0) return [];

  // Worst case: first page, last page, current page, a sibling on each
  // side, and an ellipsis on each side.
  const totalSlots = siblingCount * 2 + 5;
  if (totalPages <= totalSlots) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;
    return [...range(1, leftItemCount), "ellipsis", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;
    return [1, "ellipsis", ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", totalPages];
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export type PaginationProps = HTMLAttributes<HTMLElement>;

/**
 * A set of page controls. Compose it with `PaginationContent`,
 * `PaginationItem`, `PaginationLink`, `PaginationPrevious`,
 * `PaginationNext`, and `PaginationEllipsis`. Renders a native `<nav
 * aria-label="pagination">`.
 *
 * Deliberately presentational, like `Breadcrumb`: there's no internal
 * "current page" state to coordinate through context, since a real app's
 * current page virtually always already lives in a URL or query state a
 * caller owns — `PaginationLink`'s `isActive` prop and `getPaginationRange`
 * are how that external state turns into markup, not something this
 * component manages on its own.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>((props, ref) => (
  <nav ref={ref} aria-label="pagination" {...props} />
));
Pagination.displayName = "Pagination";

export type PaginationContentProps = HTMLAttributes<HTMLUListElement>;

export const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={mergeClassNames("flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  ),
);
PaginationContent.displayName = "PaginationContent";

export type PaginationItemProps = HTMLAttributes<HTMLLIElement>;

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  (props, ref) => <li ref={ref} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

export interface PaginationLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Marks this as the current page: sets `aria-current="page"` and applies the active look. */
  isActive?: boolean;
}

/**
 * One page number. Renders a native `<button>` rather than an `<a>` — an
 * anchor with no `href` isn't keyboard-focusable, and whether a page
 * change here should actually navigate (vs. update local/query state
 * without a URL change) varies by app, so this doesn't assume a URL the
 * way `BreadcrumbLink` reasonably can. Add `href` support yourself (or
 * swap the element) if your pagination does navigate.
 */
export const PaginationLink = forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-current={isActive ? "page" : undefined}
      className={mergeClassNames(
        "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white",
        isActive
          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
          : "text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800",
        className,
      )}
      {...props}
    />
  ),
);
PaginationLink.displayName = "PaginationLink";

export type PaginationPreviousProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The "Previous" control. Pass `disabled` yourself when there's no previous page — this component has no page-count state of its own to derive that from. */
export const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  ({ className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={mergeClassNames(
        "flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:outline-white",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      {children ?? "Previous"}
    </button>
  ),
);
PaginationPrevious.displayName = "PaginationPrevious";

export type PaginationNextProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The "Next" control. Pass `disabled` yourself when there's no next page. */
export const PaginationNext = forwardRef<HTMLButtonElement, PaginationNextProps>(
  ({ className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={mergeClassNames(
        "flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:outline-white",
        className,
      )}
      {...props}
    >
      {children ?? "Next"}
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </button>
  ),
);
PaginationNext.displayName = "PaginationNext";

export type PaginationEllipsisProps = HTMLAttributes<HTMLSpanElement>;

/** A stand-in for a run of skipped page numbers — pair with `getPaginationRange`'s `"ellipsis"` entries. Decorative, hidden from assistive tech the same way `BreadcrumbEllipsis` is. */
export const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={mergeClassNames(
        "flex h-9 w-9 items-center justify-center text-slate-400 dark:text-slate-500",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  ),
);
PaginationEllipsis.displayName = "PaginationEllipsis";
