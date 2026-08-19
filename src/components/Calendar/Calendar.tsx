import { forwardRef, useCallback, useEffect, useId, useRef, useState, type HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

// Calendar-day arithmetic, deliberately not pulled in from a date library —
// every operation this component needs (compare, add days/months, find the
// start of a month) is a handful of lines against the platform `Date`, and
// nothing here needs timezone conversion (every `Date` is always
// interpreted as a local calendar day, never as an instant).
function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}
function addMonths(date: Date, amount: number): Date {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  // Clamp rather than overflow into the month after (e.g. Jan 31 + 1 month
  // should land on Feb 28/29, not roll over into March).
  const daysInResultMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, daysInResultMonth));
  return result;
}
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Every date shown in the grid, grouped into complete weeks — including the leading/trailing days from adjacent months needed to fill the first and last rows. */
function buildWeeks(month: Date, weekStartsOn: number): Date[][] {
  const firstOfMonth = startOfMonth(month);
  const leadingOffset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(firstOfMonth, -leadingOffset);
  const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= lastOfMonth) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The selected date. */
  selected?: Date;
  /** Initial selected date when uncontrolled. */
  defaultSelected?: Date;
  /** Called when a day is activated (clicked, or Enter/Space on the focused day). */
  onSelect?: (date: Date) => void;
  /** Which month is shown (any `Date` within it). */
  month?: Date;
  /** Initial displayed month when uncontrolled. Defaults to `selected`'s month, or today's. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Marks specific dates unselectable (e.g. `(date) => date < new Date()` to block the past). */
  disabled?: (date: Date) => boolean;
  /** Which weekday starts each row, `0` (Sunday) through `6` (Saturday). Defaults to `0`. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * A month grid for picking a single date — the WAI-ARIA Date Picker
 * Dialog's grid, on its own rather than pre-wired to a popover/input the
 * way a full "date picker" widget usually is. Composing it with `Popover`
 * (a trigger button showing the formatted date, `PopoverContent` holding
 * this) gets you that widget without `Calendar` needing to own an opinion
 * about how it's triggered — the same reasoning `Sidebar` composes with
 * `Resizable` instead of growing its own drag logic, applied to composing
 * with `Popover` instead of growing its own popup.
 *
 * Renders a native `<table role="grid">` — rows are weeks, cells are days,
 * a genuinely clean native fit for a structure that already is a grid of
 * cells. Each day is a real `<button role="gridcell">`, the same
 * interactive-element-plus-role-override approach `SelectItem`/
 * `ContextMenuItem`/`AccordionTrigger` use, with roving `tabIndex`
 * (one focusable day at a time) and real DOM focus moved by the arrow
 * keys — not `aria-activedescendant` — the same choice `ContextMenu`/
 * `Select` make and for the same reason (see their own `DECISIONS.md`
 * entries). See `DECISIONS.md` for what's deliberately out of scope
 * (range selection, locale-derived week start, year-jump shortcuts).
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      selected,
      defaultSelected,
      onSelect,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      disabled,
      weekStartsOn = 0,
      className,
      ...props
    },
    ref,
  ) => {
    const headingId = useId();
    const gridRef = useRef<HTMLTableElement>(null);

    const [uncontrolledSelected, setUncontrolledSelected] = useState(defaultSelected);
    const isSelectedControlled = selected !== undefined;
    const selectedDate = isSelectedControlled ? selected : uncontrolledSelected;

    const [uncontrolledMonth, setUncontrolledMonth] = useState(
      () => defaultMonth ?? selectedDate ?? new Date(),
    );
    const isMonthControlled = monthProp !== undefined;
    const month = isMonthControlled ? monthProp : uncontrolledMonth;

    const [focusedDate, setFocusedDate] = useState(() => selectedDate ?? new Date());

    const changeMonth = useCallback(
      (next: Date) => {
        if (!isMonthControlled) setUncontrolledMonth(next);
        onMonthChange?.(next);
      },
      [isMonthControlled, onMonthChange],
    );

    const selectDate = useCallback(
      (date: Date) => {
        if (disabled?.(date)) return;
        if (!isSelectedControlled) setUncontrolledSelected(date);
        onSelect?.(date);
        if (!isSameMonth(date, month)) changeMonth(startOfMonth(date));
      },
      [disabled, isSelectedControlled, onSelect, month, changeMonth],
    );

    // Moves both which day is logically "focused" and, once the grid has
    // re-rendered around a possible month change, real DOM focus onto it —
    // looked up by `data-date` rather than tracked in an array of refs, the
    // same DOM-query approach `ContextMenu`/`Select` use for their own
    // roving focus.
    const moveFocus = useCallback(
      (date: Date) => {
        setFocusedDate(date);
        if (!isSameMonth(date, month)) changeMonth(startOfMonth(date));
      },
      [month, changeMonth],
    );

    useEffect(() => {
      const button = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-date="${toDateKey(focusedDate)}"]`,
      );
      if (button && document.activeElement !== button && gridRef.current?.contains(document.activeElement)) {
        button.focus();
      }
    }, [focusedDate, month]);

    const today = stripTime(new Date());
    const weeks = buildWeeks(month, weekStartsOn);
    const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month);
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
    const weekdayLongFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long" });

    // A disabled `<button>` can never actually receive focus — the browser
    // silently rejects it — so landing roving focus directly on a disabled
    // date would leave the grid with no focused element at all, keyboard-
    // dead until the page is tabbed away and back. `dayStep` says which
    // direction is "forward" for whichever key this is, and this walks
    // that direction one day at a time past any disabled run, the same
    // skip-disabled-options behavior `Select`/`RadioGroup` give their own
    // roving focus, bounded so a caller who disables every date can't hang
    // this in an infinite loop.
    function findEnabledDate(target: Date, dayStep: 1 | -1): Date {
      if (!disabled) return target;
      let candidate = target;
      for (let attempts = 0; attempts < 366 && disabled(candidate); attempts++) {
        candidate = addDays(candidate, dayStep);
      }
      return candidate;
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, date: Date) {
      const moves: Record<string, { target: () => Date; dayStep: 1 | -1 }> = {
        ArrowLeft: { target: () => addDays(date, -1), dayStep: -1 },
        ArrowRight: { target: () => addDays(date, 1), dayStep: 1 },
        ArrowUp: { target: () => addDays(date, -7), dayStep: -1 },
        ArrowDown: { target: () => addDays(date, 7), dayStep: 1 },
        Home: { target: () => addDays(date, -((date.getDay() - weekStartsOn + 7) % 7)), dayStep: 1 },
        End: { target: () => addDays(date, 6 - ((date.getDay() - weekStartsOn + 7) % 7)), dayStep: -1 },
        PageUp: { target: () => addMonths(date, -1), dayStep: -1 },
        PageDown: { target: () => addMonths(date, 1), dayStep: 1 },
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        moveFocus(findEnabledDate(move.target(), move.dayStep));
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectDate(date);
      }
    }

    return (
      <div ref={ref} className={mergeClassNames("w-fit", className)} {...props}>
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(addMonths(month, -1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:outline-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div id={headingId} aria-live="polite" className="text-sm font-medium text-slate-950 dark:text-white">
            {monthLabel}
          </div>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(addMonths(month, 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:outline-white"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <table ref={gridRef} role="grid" aria-labelledby={headingId} className="border-collapse">
          <thead>
            <tr>
              {weeks[0].map((day) => (
                <th
                  key={day.getDay()}
                  scope="col"
                  abbr={weekdayLongFormatter.format(day)}
                  className="h-8 w-8 text-xs font-normal text-slate-500 dark:text-slate-400"
                >
                  {weekdayFormatter.format(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toDateKey(week[0])}>
                {week.map((day) => {
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isToday = isSameDay(day, today);
                  const isOutsideMonth = !isSameMonth(day, month);
                  const isDisabled = disabled?.(day) ?? false;
                  const isFocusable = isSameDay(day, focusedDate);

                  return (
                    <td key={toDateKey(day)} role="presentation" className="p-0">
                      <button
                        type="button"
                        role="gridcell"
                        data-date={toDateKey(day)}
                        aria-selected={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        disabled={isDisabled}
                        tabIndex={isFocusable ? 0 : -1}
                        onClick={() => {
                          // Not `moveFocus(day)` here too: it and
                          // `selectDate` each independently switch the
                          // displayed month when `day` falls outside it, so
                          // calling both on one click reported the change
                          // twice. `selectDate` already owns that for the
                          // click path; this only needs to update which day
                          // is next in line for keyboard focus.
                          setFocusedDate(day);
                          selectDate(day);
                        }}
                        onKeyDown={(event) => handleKeyDown(event, day)}
                        className={mergeClassNames(
                          "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:focus-visible:outline-white",
                          isSelected
                            ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                            : "text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800",
                          !isSelected && isOutsideMonth && "text-slate-400 dark:text-slate-600",
                          !isSelected && isToday && "font-semibold underline underline-offset-4",
                        )}
                      >
                        {day.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
Calendar.displayName = "Calendar";
