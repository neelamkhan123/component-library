import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export type BreadcrumbProps = HTMLAttributes<HTMLElement>;

/**
 * A trail of links showing the current page's position in a hierarchy.
 * Compose it with `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`,
 * `BreadcrumbPage`, `BreadcrumbSeparator`, and `BreadcrumbEllipsis`. Renders
 * a native `<nav aria-label="breadcrumb">`, per the WAI-ARIA Breadcrumb
 * pattern — purely presentational, so unlike `Accordion`/`Avatar` there's no
 * state to coordinate between its parts.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (props, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />,
);
Breadcrumb.displayName = "Breadcrumb";

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement>;

/** The ordered list of `BreadcrumbItem`s — ordered because a breadcrumb trail is a strict hierarchy, not an arbitrary group. */
export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={mergeClassNames(
        "flex flex-wrap items-center gap-1.5 text-sm break-words text-slate-500 sm:gap-2.5 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement>;

/** One entry in the trail — wraps a `BreadcrumbLink` or, for the current page, a `BreadcrumbPage`. */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={mergeClassNames("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/** A navigable step in the trail. Renders a native `<a>` — pass `href` (or swap the element via your router's `asChild`-style pattern, if you have one) to make it a real link. */
export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={mergeClassNames(
        "transition-colors hover:text-slate-950 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:hover:text-white dark:focus-visible:outline-white",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>;

/**
 * The current page — the trail's last item. Renders a plain `<span
 * aria-current="page">` rather than a link, since (per the WAI-ARIA
 * Breadcrumb pattern) there's nowhere for it to navigate to.
 */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={mergeClassNames("font-medium text-slate-950 dark:text-white", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLLIElement>;

/**
 * The divider between items — a `ChevronRight` by default, or pass
 * `children` for a custom one (e.g. `"/"`). `role="presentation"` and
 * `aria-hidden` keep it out of the accessible list: assistive tech already
 * announces each item's position via the `<ol>`, so an announced glyph
 * between every pair of items would just be noise.
 */
export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={mergeClassNames("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  ),
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement>;

/** A stand-in for collapsed middle items on a long trail. Decorative — hidden from assistive tech the same way `BreadcrumbSeparator` is. */
export const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={mergeClassNames("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  ),
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
