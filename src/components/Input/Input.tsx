import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  [
    "flex w-full rounded-xl border border-slate-200 bg-white text-slate-950 transition-colors",
    "placeholder:text-slate-400 hover:border-slate-300",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900",
    "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:placeholder:text-slate-300 disabled:hover:border-slate-200",
    // `aria-invalid` is a real ARIA attribute a caller sets to mark the
    // field invalid for assistive tech — this styles off that directly
    // rather than a separate `invalid`/`error` prop that would need to be
    // kept in sync with it.
    "aria-invalid:border-red-500 aria-invalid:hover:border-red-500 aria-invalid:focus-visible:outline-red-600",
    "dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600",
    "dark:focus-visible:outline-white",
    "dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:placeholder:text-slate-700 dark:disabled:hover:border-slate-700",
    "dark:aria-invalid:border-red-500 dark:aria-invalid:hover:border-red-500 dark:aria-invalid:focus-visible:outline-red-500",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants> {}

/**
 * A single-line text input. Renders a native `<input>` — everything about
 * typing, selection, `type` variants (`email`, `password`, `search`, …),
 * and native form participation comes from the browser, so this only adds
 * sizing and the visual language shared with `Button`.
 *
 * There's no bundled label or helper/error-text component: an ordinary
 * `<label>` wrapping (or `htmlFor`-linked to) an `Input` already associates
 * the two natively, the same reasoning `Checkbox` documents for not having
 * a `CheckboxLabel`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={inputVariants({ size, className })}
      {...props}
    />
  ),
);
Input.displayName = "Input";
