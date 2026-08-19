import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { Send } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

export interface ComposerProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "rows" | "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Called when the message is submitted — Enter without Shift, or
   * clicking the send button — with the current (non-empty, trimmed)
   * value. Named to match `onValueChange`'s own vocabulary, not the
   * native `onSubmit` (a `<form>` submission event `TextareaHTMLAttributes`
   * technically carries) it shadows — `Omit`ted from the base props above
   * so this one, with its own unrelated signature, can take its place, the
   * same reason `CommandItem`'s `onSelect` needed the identical treatment.
   *
   * Doesn't clear the field itself when controlled: an uncontrolled
   * `Composer` clears on its own after submitting (nobody wants their own
   * message sitting in the box after sending), but a controlled one leaves
   * that entirely to whoever owns `value`, the same "smart default when
   * uncontrolled, hands-off when controlled" split `Accordion`/`Select`
   * already make.
   */
  onSubmit?: (value: string) => void;
  /** Height (px) the field stops growing at, scrolling instead. Defaults to `200`. */
  maxHeight?: number;
  /** Accessible label for the send button. Defaults to `"Send message"`. */
  sendLabel?: string;
}

/**
 * `Textarea` and a send button, wired together — the chat composer that
 * rounds out the chatbox trio (`Attachment`/`Bubble`/`Message`). Grows with
 * its content up to `maxHeight`, then scrolls instead of growing forever;
 * Enter submits, Shift+Enter inserts a newline, matching every chat app's
 * shared convention closely enough that it doesn't need explaining.
 *
 * Ref forwards to the `<textarea>` itself (not the wrapping `<div>`),
 * matching `Textarea`'s/`Input`'s own ref target — the thing a caller
 * actually wants after sending (to call `.focus()` again) is the field,
 * not its container.
 */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      onChange,
      onKeyDown,
      maxHeight = 200,
      sendLabel = "Send message",
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolledValue;

    // Grows with content by resetting to "auto" (so scrollHeight reflects
    // only the actual content, not a stale taller height from before this
    // change) and then reading the real content height back off it —
    // there's no CSS-only way to size a textarea to its content, since
    // `scrollHeight` is fundamentally a measured, not computed, value.
    useLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight]);

    function submit() {
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      if (!isControlled) setUncontrolledValue("");
      onSubmit?.(trimmed);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    }

    return (
      <div
        className={mergeClassNames(
          "flex w-full items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 transition-colors focus-within:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-slate-600",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <textarea
          ref={mergeRefs(textareaRef, ref)}
          rows={1}
          disabled={disabled}
          value={value}
          onChange={(event) => {
            onChange?.(event);
            if (event.defaultPrevented) return;
            if (!isControlled) setUncontrolledValue(event.target.value);
            onValueChange?.(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          style={{ maxHeight }}
          className={mergeClassNames(
            "min-h-8 flex-1 resize-none self-center overflow-y-auto bg-transparent px-1.5 py-1 text-sm text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-slate-500",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={sendLabel}
          disabled={disabled || value.trim() === ""}
          onClick={submit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:outline-white dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);
Composer.displayName = "Composer";
