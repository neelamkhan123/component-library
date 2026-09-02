import { forwardRef, type HTMLAttributes } from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  /** `"horizontal"` (the default) or `"vertical"`. */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether this is purely visual rather than a meaningful break between
   * sections. Defaults to `true` — most separators in a UI divide visually
   * related things (two buttons in a toolbar, a card's header from its
   * body) rather than marking a genuine thematic shift a screen reader
   * user needs announced, the same bias `BreadcrumbSeparator` and
   * `CarouselDots` already take for their own purely-visual marks.
   */
  decorative?: boolean;
}

/**
 * A thin dividing line. Renders a native `<hr>` — which already carries an
 * implicit `separator` role, so a meaningful (non-`decorative`) instance
 * needs no ARIA of its own beyond `aria-orientation` for the vertical case
 * (the default orientation `<hr>`'s role implies is horizontal). A
 * `decorative` one is hidden from assistive tech entirely via
 * `aria-hidden`, rather than trying to strip the implicit role.
 *
 * `orientation="vertical"` stretches to the height of its flex container
 * (`self-stretch`, not `h-full`) — the same fix a real bug in `Resizable`
 * needed: a percentage height can't resolve against a container whose own
 * height is intrinsic rather than an explicit value, while `self-stretch`
 * sidesteps percentage resolution entirely. Outside a flex row, a vertical
 * separator has no height to stretch to and needs one set explicitly via
 * `className`.
 */
export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = "horizontal", decorative = true, className, ...props }, ref) => (
    <hr
      ref={ref}
      aria-hidden={decorative ? "true" : undefined}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      className={mergeClassNames(
        "shrink-0 border-0 bg-slate-200 dark:bg-slate-800",
        orientation === "vertical" ? "h-auto w-px self-stretch" : "h-px w-full",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";
