import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The bordered surface a block renders inside. Fixed-height with its own
 * scroll, so a tall block doesn't stretch the page it is being browsed on.
 *
 * Two kinds of block sit in here and they scroll differently. A page-shaped
 * block (pricing, a settings form) is a column of content taller than the
 * frame, so the frame itself scrolls it. An app shell (the dashboard, the
 * chat panel) already has a scrolling region of its own inside a fixed
 * chrome; scrolling *that* in the frame as well would drag the sidebar and
 * header out of view, which is the one thing a shell is meant to keep still.
 * `fills` is the second case: the block is handed the frame's exact height
 * and the frame stops scrolling, leaving the block's own overflow to do it.
 *
 * Note what this deliberately isn't: a device-width switcher. Tailwind's
 * responsive variants answer to the viewport, not to this box, so narrowing
 * a frame around a block would shrink the layout without ever tripping the
 * breakpoints — a desktop layout squeezed into a phone-shaped hole, which
 * is worse than no preview at all. The "Full width" page is the honest
 * version: resize the actual window and the actual breakpoints fire.
 */
export function BlockFrame({
  children,
  height,
  fills = false,
  className,
}: {
  children: ReactNode;
  /** e.g. "44rem". Omit to let the block take its natural height. */
  height?: string;
  /**
   * The block manages its own scrolling and should fill the frame exactly.
   * Requires `height` to be at least the block's own minimum, or the block
   * overflows a frame that no longer scrolls.
   */
  fills?: boolean;
  className?: string;
}) {
  return (
    <div
      style={height ? { height } : undefined}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
        fills ? "overflow-hidden" : "overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
