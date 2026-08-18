import { forwardRef, type TextareaHTMLAttributes } from "react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * A multi-line text input. Renders a native `<textarea>` — `Input`'s
 * sibling in every respect but the element itself: same border/focus/
 * disabled visual language, and invalid state is styled off `aria-invalid`
 * directly for the same reason documented on `Input` (it's already the
 * real signal a caller sets for assistive tech, so a separate `invalid`
 * prop would just be a second place to keep in sync with it).
 *
 * Resizing is restricted to vertical (`resize-y`) rather than the
 * browser's default both-axes handle — horizontal resizing routinely
 * breaks a form's column layout in a way vertical resizing doesn't, and
 * is disabled entirely once the field itself is `disabled`. `rows`
 * defaults to `3`, since the unset native default of `2` reads as
 * noticeably cramped for anything meant to hold more than a single line.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={mergeClassNames(
        "flex w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:resize-none disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:placeholder:text-slate-300 disabled:hover:border-slate-200 aria-invalid:border-red-500 aria-invalid:hover:border-red-500 aria-invalid:focus-visible:outline-red-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus-visible:outline-white dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:placeholder:text-slate-700 dark:disabled:hover:border-slate-700 dark:aria-invalid:border-red-500 dark:aria-invalid:hover:border-red-500 dark:aria-invalid:focus-visible:outline-red-500",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
