import { forwardRef, type HTMLAttributes } from "react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width-to-height ratio, e.g. `16 / 9` or `4 / 3`. Defaults to `1` (square). */
  ratio?: number;
}

/**
 * Constrains its content to a fixed width-to-height ratio — wrap an
 * `<img>`/`<video>` (styled `absolute inset-0 h-full w-full object-cover`,
 * the same fill technique `AvatarImage` already uses inside `Avatar`'s
 * fixed-size box) to keep media a consistent shape regardless of its own
 * dimensions.
 *
 * `ratio` is a plain number applied via the native CSS `aspect-ratio`
 * property through inline `style`, not a Tailwind `aspect-[...]` class —
 * unlike `Sidebar`'s `width` or `Resizable`'s panel sizes, this isn't about
 * a same-property class-ordering conflict; a caller-supplied *continuous*
 * value (any ratio, not a fixed set of variants) is what `style` is for,
 * the same reason `Progress`'s fill width is set inline rather than
 * picking from preset width classes.
 *
 * The value is written as `"<ratio> / 1"`, not the bare number — jsdom
 * (this component's own tests included) rejects a plain unitless number
 * for `aspect-ratio` outright and silently drops the whole declaration,
 * even though a real browser accepts it fine; the explicit `/ 1` is the
 * same ratio, written in a form both actually accept.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, className, ...props }, ref) => (
    <div
      ref={ref}
      style={{ aspectRatio: `${ratio} / 1`, ...style }}
      className={mergeClassNames("relative w-full overflow-hidden", className)}
      {...props}
    />
  ),
);
AspectRatio.displayName = "AspectRatio";
