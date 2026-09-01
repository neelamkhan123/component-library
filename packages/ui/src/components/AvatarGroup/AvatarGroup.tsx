import { Children, cloneElement, forwardRef, isValidElement, type HTMLAttributes, type ReactElement } from "react";
import { Avatar, type AvatarProps } from "../Avatar/Avatar";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

type AvatarSize = NonNullable<AvatarProps["size"]>;

/** Negative margins that produce the overlap, per size. */
const overlapClassNames: Record<AvatarSize, string> = {
  sm: "-ml-2 first:ml-0",
  md: "-ml-2.5 first:ml-0",
  lg: "-ml-3 first:ml-0",
};

const overflowTextClassNames: Record<AvatarSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Names the set of people for assistive tech, e.g. `"Team members"`.
   * Required — a bare stack of images has no accessible meaning on its own.
   */
  label: string;
  /** Renders at most this many avatars, replacing the rest with a `+N` counter. Omit to show every child. */
  max?: number;
  /** Applied to every `Avatar` child, overriding the size each sets itself. Defaults to `"md"`. */
  size?: AvatarSize;
  /**
   * The true total, when `children` is already only the first few of a much
   * larger set. Drives the `+N` counter in place of the child count.
   */
  total?: number;
}

/**
 * A stack of overlapping `Avatar`s — the usual "who's on this" cluster.
 * Takes `Avatar` elements as children and applies the size and overlap
 * itself, so callers can't accidentally mix sizes within one stack.
 *
 * Every avatar reserves its box before any image loads, because `Avatar`'s
 * own size variants are fixed `h-*`/`w-*` and `AvatarFallback` fills the
 * same box while loading. The group's width is therefore settled at first
 * paint and doesn't reflow as images arrive — the layout-shift trap this
 * component exists to avoid (WCAG 2.2's stable-layout intent; CLS in the
 * Core Web Vitals sense).
 *
 * A `ring` in the surface color separates adjacent circles — the same "2px
 * surface gap between touching fills" rule `Chart` follows, so the stack
 * reads as distinct people rather than one blob.
 *
 * Marked `role="group"` with the required `label`, rather than a list: the
 * stack is one compound control-free unit and per-avatar list semantics add
 * announcement noise without adding navigation the user wants here.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ label, max, size = "md", total, className, children, ...props }, ref) => {
    const avatars = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
    const visible = max === undefined ? avatars : avatars.slice(0, max);
    const overflow = (total ?? avatars.length) - visible.length;

    const stackClassName = mergeClassNames(
      overlapClassNames[size],
      "ring-2 ring-white dark:ring-slate-950",
    );

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={mergeClassNames("flex items-center", className)}
        {...props}
      >
        {visible.map((avatar, index) =>
          cloneElement(avatar, {
            key: avatar.key ?? index,
            size,
            className: mergeClassNames(stackClassName, avatar.props.className),
          }),
        )}
        {overflow > 0 ? (
          <Avatar
            size={size}
            // Not `aria-hidden` — "and 4 more" is information a screen-reader
            // user needs as much as a sighted one, and it isn't stated
            // anywhere else in the group.
            className={mergeClassNames(
              stackClassName,
              "items-center justify-center bg-slate-100 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300",
              overflowTextClassNames[size],
            )}
          >
            <span className="sr-only">{`and ${overflow} more`}</span>
            <span aria-hidden="true">{`+${overflow}`}</span>
          </Avatar>
        ) : null}
      </div>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";
