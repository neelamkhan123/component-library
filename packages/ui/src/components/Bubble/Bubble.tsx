import { forwardRef, type HTMLAttributes } from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  /** Whose message this is — which side it aligns to and which color it takes. Defaults to `"incoming"`. */
  variant?: "incoming" | "outgoing";
}

/**
 * A chat message bubble. Self-aligning: an `"outgoing"` bubble pushes
 * itself to the right (`margin-left: auto`) on its own, so a plain list
 * of `Bubble`s stacked in a `flex flex-col` already reads as a
 * conversation with no other component required — the lowest-ceremony
 * way to get a working chat log, which matters for exactly the "help a
 * beginner get started" goal this was asked for. Reach for `Message` on
 * top of it once you also need an avatar, sender name, or timestamp
 * alongside the bubble.
 */
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(
  ({ variant = "incoming", className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames(
        "w-fit max-w-[75%] px-3.5 py-2 text-sm break-words",
        variant === "outgoing"
          ? "ml-auto rounded-2xl rounded-br-md bg-slate-950 text-white dark:bg-white dark:text-slate-950"
          : "rounded-2xl rounded-bl-md bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white",
        className,
      )}
      {...props}
    />
  ),
);
Bubble.displayName = "Bubble";
