import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClassNames } from "../../utils/mergeClassNames";

const toggleVariants = cva(
  // Pressed state is driven by `aria-pressed` directly (a Tailwind
  // built-in ARIA variant, the same technique `Input`'s `aria-invalid:`
  // and `Checkbox`'s `checked:` use) rather than a separate `data-state`
  // attribute — `aria-pressed` is already the real signal a toggle button
  // exposes to assistive tech, so a second attribute carrying the same
  // fact would just be something else to keep in sync with it.
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap text-slate-950 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-slate-950 aria-pressed:text-white aria-pressed:hover:bg-slate-800 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px] dark:aria-pressed:bg-white dark:aria-pressed:text-slate-950 dark:aria-pressed:hover:bg-slate-200",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-transparent",
        outline: "border border-slate-200 bg-transparent dark:border-slate-700",
      },
      size: {
        sm: "h-8 px-2.5",
        md: "h-10 px-3",
        lg: "h-11 px-4",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

/**
 * A two-state button — pressed or not — for toolbar-style on/off actions
 * (bold/italic formatting, a view filter), not a form value the way
 * `Checkbox`/`Switch` are. Renders a native `<button aria-pressed>`: per
 * WAI-ARIA, that's already a complete toggle button on its own, so unlike
 * every other state-driven control in this library, there's no role to
 * recategorize and no separate native element to restyle — just a
 * `<button>` with one attribute doing double duty for both accessibility
 * and styling.
 *
 * Unlike `Checkbox`/`Switch`, whose controlled/uncontrolled `checked`
 * comes from the native `<input>` itself, a plain `<button>` has no
 * built-in notion of a persistent pressed state, so `Toggle` tracks
 * `defaultPressed` with its own `useState` rather than deferring to the
 * DOM the way those two do.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      pressed: pressedProp,
      defaultPressed = false,
      onPressedChange,
      onClick,
      className,
      variant,
      size,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed);
    const isControlled = pressedProp !== undefined;
    const pressed = isControlled ? pressedProp : uncontrolledPressed;

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={pressed}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const next = !pressed;
          if (!isControlled) setUncontrolledPressed(next);
          onPressedChange?.(next);
        }}
        className={mergeClassNames(toggleVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Toggle.displayName = "Toggle";
