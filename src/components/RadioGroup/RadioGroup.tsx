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

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

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
      <span className="relative inline-flex h-4 w-4 shrink-0">
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
            "peer h-4 w-4 shrink-0 appearance-none rounded-full border border-slate-300 bg-white transition-colors checked:border-slate-950 hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:checked:border-white dark:hover:border-slate-500 dark:focus-visible:outline-white dark:disabled:border-slate-700 dark:disabled:bg-slate-900",
            className,
          )}
          {...props}
        />
        {/*
          Purely visual, same as Checkbox's overlaid Check/Minus icons: the
          selected state is already communicated by the native input's own
          checked property, so this dot adds nothing for assistive tech.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-white" />
        </span>
      </span>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
