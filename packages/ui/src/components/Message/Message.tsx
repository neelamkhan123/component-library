import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Whose message this is — which side the avatar and content align to. Defaults to `"incoming"`. Match it to any `Bubble` children's own `variant`. */
  variant?: "incoming" | "outgoing";
  /** Typically an `<Avatar>`. Omit to leave the space uncaptured — common for your own outgoing messages, which many chat UIs don't show an avatar next to at all. */
  avatar?: ReactNode;
  sender?: ReactNode;
  timestamp?: ReactNode;
}

/**
 * One row in a conversation: an optional avatar, an optional sender name/
 * timestamp line, and its content underneath — typically a `Bubble`, or
 * more than one for a quick burst of messages sent together. `Message`
 * only owns the row's layout (alignment, avatar placement, the name/
 * timestamp line); the message content itself is composed in as
 * children rather than baked in, the same layout-versus-content split
 * `Card`'s `CardHeader` and `Dialog`'s `DialogHeader` draw for their own
 * families.
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ variant = "incoming", avatar, sender, timestamp, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames(
        "flex items-end gap-2",
        variant === "outgoing" && "flex-row-reverse",
        className,
      )}
      {...props}
    >
      {avatar ? <div className="shrink-0">{avatar}</div> : null}
      <div
        className={mergeClassNames(
          "flex min-w-0 flex-col gap-1",
          variant === "outgoing" ? "items-end" : "items-start",
        )}
      >
        {sender || timestamp ? (
          <div className="flex items-center gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
            {sender ? (
              <span className="font-medium text-slate-700 dark:text-slate-300">{sender}</span>
            ) : null}
            {timestamp ? <span>{timestamp}</span> : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  ),
);
Message.displayName = "Message";
