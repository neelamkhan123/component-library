import { forwardRef, type HTMLAttributes } from "react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export interface TypingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Announced to assistive tech in place of visible text. Defaults to `"Typing…"` — pass something like `"Jane is typing…"` when the chat UI knows who. */
  label?: string;
}

/**
 * Three bouncing dots in a bubble — the "someone is typing" indicator that
 * rounds out the chatbox trio (`Attachment`/`Bubble`/`Message`). Styled to
 * match `Bubble`'s own incoming shape directly, since this is meant to sit
 * exactly where an incoming `Bubble` would, standing in for one that hasn't
 * arrived yet.
 *
 * `role="status"` (implicit `aria-live="polite"`) — unlike `Skeleton`,
 * which is explicitly `aria-hidden` and leaves announcing a loading state
 * to whatever wraps a whole batch of them, a `TypingIndicator` *is* the
 * live status on its own (there's normally just one, for whoever's
 * currently typing), so it announces itself rather than needing a caller
 * to wrap it in anything.
 */
export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ label = "Typing…", className, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={mergeClassNames(
        "flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-3 dark:bg-slate-800",
        className,
      )}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          style={{ animationDelay: `${index * 150}ms` }}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none dark:bg-slate-500"
        />
      ))}
    </div>
  ),
);
TypingIndicator.displayName = "TypingIndicator";
