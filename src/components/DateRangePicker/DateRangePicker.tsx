import { forwardRef, useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { buttonVariants } from "../Button/Button";
import { Calendar } from "../Calendar/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";
import { RadioGroup, RadioGroupItem } from "../RadioGroup/RadioGroup";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

// The same "plain `Date` arithmetic beats a date dependency" position
// `Calendar` documents — every operation here is a couple of lines, and
// nothing needs timezone conversion since a range is a pair of local
// calendar days, never a pair of instants.
function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** An inclusive span of calendar days. `from` and `to` may be the same day. */
export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangePreset {
  /** Shown in the preset list, and matched against to decide which row is selected. */
  label: string;
  /** Computed on selection rather than stored, so "Last 7 days" stays relative to today across a long-lived session. */
  getRange: () => DateRange;
}

/** The preset rows a dashboard filter almost always wants, relative to today. */
export const defaultDateRangePresets: DateRangePreset[] = [
  { label: "Last 7 days", getRange: () => ({ from: addDays(stripTime(new Date()), -6), to: stripTime(new Date()) }) },
  { label: "Last 30 days", getRange: () => ({ from: addDays(stripTime(new Date()), -29), to: stripTime(new Date()) }) },
  { label: "Last 90 days", getRange: () => ({ from: addDays(stripTime(new Date()), -89), to: stripTime(new Date()) }) },
  {
    label: "Month to date",
    getRange: () => {
      const today = stripTime(new Date());
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    },
  },
  {
    label: "Year to date",
    getRange: () => {
      const today = stripTime(new Date());
      return { from: new Date(today.getFullYear(), 0, 1), to: today };
    },
  },
];

function formatDateRange(range: DateRange): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return isSameDay(range.from, range.to)
    ? formatter.format(range.from)
    : `${formatter.format(range.from)} – ${formatter.format(range.to)}`;
}

export interface DateRangePickerProps {
  /** The selected range. */
  value?: DateRange;
  /** Initial range when uncontrolled. */
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  /** Replaces the preset rows. Pass `[]` for a custom-range-only picker. */
  presets?: DateRangePreset[];
  /** Overrides how the selected range is written on the trigger. */
  formatValue?: (range: DateRange) => string;
  /** Marks dates unselectable in the custom-range calendars, e.g. `(date) => date > new Date()` to block the future. */
  disabled?: (date: Date) => boolean;
  /** The trigger's accessible name. Defaults to `"Date range"`. */
  label?: string;
  /** Rendered on the trigger when nothing is selected yet. */
  placeholder?: ReactNode;
  className?: string;
}

/**
 * The time-period filter a dashboard is read through — a trigger showing the
 * current range, a list of relative presets, and a custom from/to range
 * behind a hairline below them.
 *
 * Assembled almost entirely out of components this library already has:
 * `Popover` for the panel (and with it Escape, outside-click, and top-layer
 * rendering, none of it reimplemented), two `Calendar`s for the custom range,
 * and `RadioGroup` for the presets. That last one matters most — the presets
 * are mutually exclusive options, which is exactly a radio group, so making
 * them real `<input type="radio">`s means arrow-key navigation, mutual
 * exclusivity, and the "3 of 5" announcement all come from the browser rather
 * than from a hand-rolled `role="listbox"` with its own roving focus. It is
 * the same instinct behind `DataTable` building on `Table` and `Pagination`.
 *
 * Two calendars, one per endpoint, rather than one grid with range-painting
 * hover: a single-grid range picker has to express "click once for the start,
 * again for the end" through hover preview alone, which is invisible to
 * keyboard and touch users and unannounced to assistive tech. Labelled
 * start/end grids make the same selection unambiguous on every input mode,
 * and let `Calendar` stay the single-date component it already is. The end
 * grid disables everything before the start (and vice versa), so an inverted
 * range can't be produced at all.
 *
 * Presets store a *function*, not a range, so "Last 7 days" is recomputed on
 * selection and can't silently mean last week in a tab left open overnight.
 */
export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      presets = defaultDateRangePresets,
      formatValue = formatDateRange,
      disabled,
      label = "Date range",
      placeholder = "Pick a date range",
      className,
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const range = isControlled ? value : uncontrolledValue;

    const commit = (next: DateRange) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    };

    // Which preset row is checked — derived from the range itself rather than
    // held in its own state, so a caller-controlled `value` and the checked
    // row can never disagree, and a custom range simply matches nothing.
    const selectedPresetLabel =
      range &&
      presets.find((preset) => {
        const presetRange = preset.getRange();
        return isSameDay(presetRange.from, range.from) && isSameDay(presetRange.to, range.to);
      })?.label;

    return (
      <Popover>
        <PopoverTrigger
          ref={ref}
          aria-label={label}
          className={mergeClassNames(
            buttonVariants({ variant: "outline", size: "md" }),
            "w-auto justify-start gap-2 font-normal",
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
          {range ? formatValue(range) : placeholder}
        </PopoverTrigger>
        <PopoverContent aria-label={label} className="w-auto p-0">
          {presets.length > 0 ? (
            <RadioGroup
              value={selectedPresetLabel ?? ""}
              onValueChange={(nextLabel) => {
                const preset = presets.find((candidate) => candidate.label === nextLabel);
                if (preset) commit(preset.getRange());
              }}
              aria-label="Preset ranges"
              className="flex flex-col gap-0 p-2"
            >
              {presets.map((preset) => (
                <label
                  key={preset.label}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                >
                  <RadioGroupItem value={preset.label} />
                  {preset.label}
                </label>
              ))}
            </RadioGroup>
          ) : null}

          <div
            className={mergeClassNames(
              "flex flex-col gap-4 p-3 sm:flex-row",
              presets.length > 0 && "border-t border-slate-200 dark:border-slate-800",
            )}
          >
            <div className="flex flex-col gap-1.5">
              <span className="px-1 text-xs font-medium text-slate-500 dark:text-slate-400">Start</span>
              <Calendar
                aria-label="Start date"
                selected={range?.from}
                defaultMonth={range?.from}
                // Selecting a start after the current end would invert the
                // range, so those days are unselectable rather than silently
                // swapped — a swap would move an endpoint the user didn't touch.
                disabled={(date) => Boolean(disabled?.(date)) || Boolean(range && stripTime(date) > stripTime(range.to))}
                onSelect={(from) => commit({ from: stripTime(from), to: range ? range.to : stripTime(from) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="px-1 text-xs font-medium text-slate-500 dark:text-slate-400">End</span>
              <Calendar
                aria-label="End date"
                selected={range?.to}
                defaultMonth={range?.to}
                disabled={(date) => Boolean(disabled?.(date)) || Boolean(range && stripTime(date) < stripTime(range.from))}
                onSelect={(to) => commit({ from: range ? range.from : stripTime(to), to: stripTime(to) })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
DateRangePicker.displayName = "DateRangePicker";
