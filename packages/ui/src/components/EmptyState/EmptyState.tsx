import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** A decorative illustration or icon above the title. Hidden from assistive tech. */
  icon?: ReactNode;
  /** What's missing, as a short statement — "No projects yet", not "Empty". */
  title: ReactNode;
  /**
   * Which element renders the `title`. Defaults to `"p"` — pass the heading
   * level the surrounding outline calls for (`"h2"`, `"h3"`, …) where the
   * empty state owns a section of the page.
   */
  titleAs?: "p" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Why it's empty and what will fill it. Optional, but it's what turns a dead end into an instruction. */
  description?: ReactNode;
  /** The way out — typically a `Button`. Rendered under the description. */
  action?: ReactNode;
  /**
   * Renders the region as `role="status"` with `aria-live="polite"`, so an
   * empty state that *replaces* content in place (a filter matching nothing,
   * a finished load returning zero rows) is announced. Leave off — the
   * default — when the empty state is present on first paint, where a live
   * region would announce nothing anyway.
   */
  live?: boolean;
}

/**
 * The "there's nothing here yet" panel for a region that has no data —
 * before the first record is created, after a filter matches nothing, or
 * when a feature hasn't been used yet.
 *
 * The `title` renders as a `<p>` by default, not a heading. An empty state
 * can appear inside a card, a table body, a tab panel, or a whole page, and
 * only the caller knows which heading level would be correct there — guessing
 * one produces skipped levels (WCAG 1.3.1), the same reason `CardTitle` fixes
 * on `h3` only because a card's nesting is predictable and an empty state's
 * isn't. `titleAs` names the element instead of taking a heading *element* as
 * `title`, so the level is chosen without ever nesting a heading inside the
 * paragraph that styles it — which would be invalid HTML.
 *
 * `icon` is `aria-hidden` throughout: it always duplicates the title beside
 * it, the same treatment `Badge` and `Button` give their icon slots.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, titleAs: TitleElement = "p", description, action, live = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      {...(live ? { role: "status", "aria-live": "polite" } : {})}
      className={mergeClassNames(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-800",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
        >
          {icon}
        </span>
      ) : null}
      <TitleElement className="text-sm font-semibold text-slate-950 dark:text-white">{title}</TitleElement>
      {description ? (
        <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
      {children}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";
