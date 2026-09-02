import {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { Check, Minus } from "lucide-react";
import { mergeClassNames } from "../../utils/mergeClassNames";

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

export type CheckedState = boolean | "indeterminate";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked"> {
  /**
   * `true`, `false`, or `"indeterminate"` for a partially-checked state
   * (e.g. a "select all" checkbox over a mixed selection). Omit to let the
   * checkbox manage its own state, same as a plain `<input>`.
   */
  checked?: CheckedState;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * A tri-state checkbox: checked, unchecked, or indeterminate. Renders a
 * real `<input type="checkbox">`, restyled with `appearance-none` and
 * Tailwind's `checked:`/`indeterminate:` variants, rather than a hidden
 * input paired with a fake `div`-based visual — so keyboard activation
 * (Space), focus, and participation in a native `<form>`'s data all come
 * from the browser instead of being reimplemented.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isIndeterminate = checked === "indeterminate";

    // `indeterminate` is a DOM property, not an HTML attribute or a React
    // prop `<input>` accepts — it can only ever be set imperatively, so it's
    // applied to the underlying element directly rather than through JSX.
    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = isIndeterminate;
    }, [isIndeterminate]);

    return (
      <span className="relative inline-flex h-4 w-4 shrink-0">
        <input
          ref={mergeRefs(inputRef, ref)}
          type="checkbox"
          checked={checked === undefined ? undefined : checked === true}
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
          className={mergeClassNames(
            "peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-slate-300 bg-white transition-colors checked:border-slate-950 checked:bg-slate-950 indeterminate:border-slate-950 indeterminate:bg-slate-950 hover:border-slate-400 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:checked:border-white dark:checked:bg-white dark:indeterminate:border-white dark:indeterminate:bg-white dark:hover:border-slate-500 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px] dark:disabled:border-slate-700 dark:disabled:bg-slate-900",
            className,
          )}
          {...props}
        />
        {/*
          Purely visual — the checkbox's state is already communicated by the
          native input's own checked/indeterminate properties (and whatever
          `aria-label`/associated `<label>` names it), so these add nothing
          to the accessible name and are hidden from assistive tech.
        */}
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-4 w-4 scale-50 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100 dark:text-slate-950"
        />
        <Minus
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-4 w-4 scale-50 text-white opacity-0 transition-all peer-indeterminate:scale-100 peer-indeterminate:opacity-100 dark:text-slate-950"
        />
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
