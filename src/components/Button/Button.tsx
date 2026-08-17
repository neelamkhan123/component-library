import { ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "flex items-center justify-center gap-2 rounded-xl border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white disabled:text-slate-300 loading:cursor-wait loading:opacity-80 dark:focus-visible:outline-white dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-600",
  {
    variants: {
      variant: {
        default:
          "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
        secondary:
          "border-transparent bg-slate-100 text-slate-950 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
        outline:
          "border-slate-200 bg-white text-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900",
        destructive:
          "border-transparent bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
        ghost:
          "border-transparent bg-transparent text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800",
        link: "border-transparent bg-transparent px-0 text-slate-950 underline underline-offset-4 hover:text-slate-600 dark:text-white dark:hover:text-slate-300",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Content rendered before the label, e.g. an icon or image. Hidden from assistive tech. */
  icon?: ReactNode;
  /** Shows a busy state and disables the button. */
  loading?: boolean;
}

/**
 * A versatile, accessible button supporting multiple visual variants, sizes,
 * an optional icon slot, and a loading state. Built with `class-variance-authority`
 * and supports light/dark themes via Tailwind's `dark:` variant.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      loading = false,
      disabled,
      icon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {icon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
