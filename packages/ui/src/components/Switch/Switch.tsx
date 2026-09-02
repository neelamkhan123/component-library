import { forwardRef, type InputHTMLAttributes } from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * A binary on/off toggle. Renders a real `<input type="checkbox"
 * role="switch">` — WAI-ARIA describes `switch` as exactly this: "a
 * checkbox that can be used as a switch", so the native checkbox input
 * already has everything a switch needs (keyboard toggling via Space,
 * form participation, checked-state exposure to assistive tech) without
 * reaching for a hand-rolled `<button role="switch">`. This is `Checkbox`'s
 * sibling in every respect except the visual and the tri-state:
 * `indeterminate` has no equivalent here — a switch, unlike a checkbox, is
 * always simply on or off.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => (
    <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
        className={mergeClassNames(
          "peer h-6 w-11 shrink-0 appearance-none rounded-full border border-slate-200 bg-slate-200 transition-colors checked:border-slate-950 checked:bg-slate-950 hover:border-slate-300 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:checked:border-white dark:checked:bg-white dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
          className,
        )}
        {...props}
      />
      {/*
        Purely visual, the same reasoning as Checkbox's overlaid Check/Minus
        icons: the switch's state is already communicated by the native
        input's own checked property, so the thumb adds nothing for
        assistive tech. It only ever needs to slide (`translate-x`, driven
        by `peer-checked`) — unlike Checkbox's icon, which only ever needs
        to fade — since a switch's whole visual language is "the thumb
        moved to the other side," not "a mark appeared."
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 translate-x-0 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none peer-checked:translate-x-5 peer-disabled:opacity-50 dark:peer-checked:bg-slate-950"
      />
    </span>
  ),
);
Switch.displayName = "Switch";
