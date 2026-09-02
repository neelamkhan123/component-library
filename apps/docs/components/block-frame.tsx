import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The bordered surface a block renders inside. Fixed-height with its own
 * scroll, so a tall block doesn't stretch the page it is being browsed on —
 * blocks that manage their own scrolling (an app shell, a chat panel) fill
 * it exactly, and the rest scroll within it.
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
  className,
}: {
  children: ReactNode;
  /** e.g. "44rem". Omit to let the block take its natural height. */
  height?: string;
  className?: string;
}) {
  return (
    <div
      style={height ? { height } : undefined}
      className={cn(
        "w-full overflow-y-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      {children}
    </div>
  );
}
