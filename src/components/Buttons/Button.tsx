import { ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white disabled:text-slate-300 loading:cursor-wait loading:opacity-80",
  {
    variants: {
      variant: {
        default: "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-950 hover:bg-slate-200",
        outline: "border-slate-200 bg-white text-slate-950 hover:bg-slate-50",
        destructive:
          "border-transparent bg-red-50 text-red-600 hover:bg-red-100",
        ghost:
          "border-transparent bg-transparent text-slate-950 hover:bg-slate-100",
        link: "border-transparent bg-transparent px-0 text-slate-950 underline underline-offset-4 hover:text-slate-600",
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
  icon?: ReactNode;
  loading?: boolean;
}

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
