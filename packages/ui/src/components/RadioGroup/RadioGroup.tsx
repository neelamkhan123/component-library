import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(component: string): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <RadioGroup>.`);
  }
  return context;
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Shared across every `RadioGroupItem` so the browser's own radio-group
   * behavior (mutual exclusivity, arrow-key navigation between them) applies.
   * Omit to have one generated.
   */
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Disables every item in the group. An individual `RadioGroupItem` can still override this itself. */
  disabled?: boolean;
}

/**
 * A set of mutually exclusive options. Compose it with `RadioGroupItem`.
 * Renders `<div role="radiogroup">` — supply `aria-label` or
 * `aria-labelledby` yourself, since (unlike `Breadcrumb`'s always-the-same
 * `nav` label) what a radio group represents is inherently specific to
 * each use, not something this component could reasonably hardcode.
 *
 * There's no bundled label per item either: wrap a `RadioGroupItem` and
 * its text in an ordinary `<label>`, the same reasoning `Checkbox`'s
 * decisions give for not having a `CheckboxLabel`.
 */
export function RadioGroup({
  name: nameProp,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const generatedName = useId();
  const name = nameProp ?? generatedName;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolledValue;

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <RadioGroupContext.Provider value={{ name, value, onValueChange: handleValueChange, disabled }}>
      <div
        role="radiogroup"
        className={mergeClassNames("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "checked"> {
  value: string;
}

/**
 * One option. Renders a real `<input type="radio">`, restyled with
 * `appearance-none` — the same reasoning `Checkbox` gives for not using a
 * hidden-input-plus-fake-`div` visual. Sharing `name` across every item in
 * the group (via `RadioGroup`) means mutual exclusivity *and* arrow-key
 * navigation between options both come from the browser too — radio
 * inputs are one native element `Checkbox` doesn't have a counterpart
 * for, since a checkbox has no notion of a mutually-exclusive group.
 */
export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, className, disabled, onChange, ...props }, ref) => {
    const context = useRadioGroupContext("RadioGroupItem");

    return (
      <input
        ref={ref}
        type="radio"
        name={context.name}
        value={value}
        checked={context.value === value}
        disabled={disabled ?? context.disabled}
        onChange={(event) => {
          onChange?.(event);
          if (event.target.checked) context.onValueChange(value);
        }}
        className={mergeClassNames(
          // The selected dot is a background on the input itself, not an
          // overlaid element the way Checkbox draws its Check/Minus icons.
          // A radio's dot is a plain circle, so a gradient can draw it — and
          // painting it *on* the control keeps the two from drifting apart
          // when a caller nudges the input (`className="mt-0.5"`, to sit it
          // on the first line of a wrapping label), which an absolutely
          // positioned sibling would not survive. It is purely visual
          // either way: the checked state is already the input's own.
          "peer h-4 w-4 shrink-0 appearance-none rounded-full border border-slate-300 bg-white text-slate-950 transition-colors checked:border-slate-950 checked:bg-[radial-gradient(circle,currentColor_2.5px,transparent_3px)] hover:border-slate-400 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:checked:border-white dark:hover:border-slate-500 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px] dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-600",
          className,
        )}
        {...props}
      />
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
