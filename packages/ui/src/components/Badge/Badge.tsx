import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClassNames } from "../../utils/mergeClassNames";

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-950 text-white dark:bg-white dark:text-slate-950",
        secondary: "border-transparent bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white",
        outline: "border-slate-200 bg-transparent text-slate-950 dark:border-slate-700 dark:text-white",
        destructive: "border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/**
 * A small status pill — a count, a tag, a state label. Renders a plain
 * `<span>`, not a `<button>`: a badge is informational, not an action, the
 * same non-interactive default `Card` and `Avatar` take. `variant` reuses
 * `Button`'s own vocabulary (`default`/`secondary`/`outline`/`destructive`)
 * for a consistent visual language between the two, minus `ghost`/`link`,
 * which are about interaction states a static badge doesn't have.
 *
 * No built-in dismiss button in this pass — `Attachment`'s `onRemove` is
 * the pattern to reach for if a caller needs a removable badge (a filter
 * chip, say); it wasn't duplicated here without a concrete need driving its
 * design, the same restraint `Progress` and `Skeleton` show not guessing at
 * features nothing in this library yet asks for.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ variant, className, ...props }, ref) => (
  <span ref={ref} className={mergeClassNames(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = "Badge";
