import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DateRangePicker, defaultDateRangePresets, type DateRange } from "./DateRangePicker";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — stubbed exactly as in
// Popover.test.tsx, which explains the full reasoning.
const openPopovers = new WeakSet<Element>();
let originalMatches: typeof Element.prototype.matches;

function withNewState(event: Event, newState: "open" | "closed"): Event {
  Object.defineProperty(event, "newState", { value: newState });
  return event;
}

beforeEach(() => {
  originalMatches = Element.prototype.matches;
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    openPopovers.add(this);
    this.style.display = "block";
    this.dispatchEvent(withNewState(new Event("toggle"), "open"));
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    openPopovers.delete(this);
    this.style.removeProperty("display");
    this.dispatchEvent(withNewState(new Event("toggle"), "closed"));
  };
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return openPopovers.has(this);
    return originalMatches.call(this, selector);
  } as typeof originalMatches;
});

afterEach(() => {
  Element.prototype.matches = originalMatches;
});

// `PopoverContent` defers `showPopover()` by a frame, so the panel isn't in
// the accessibility tree the instant the click resolves — every query below
// would otherwise race it.
async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Date range" }));
  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
}

const range: DateRange = { from: new Date(2026, 0, 5), to: new Date(2026, 0, 19) };

test("DateRangePicker renders with no accessibility violations", async () => {
  const { container } = render(<DateRangePicker defaultValue={range} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("DateRangePicker's open panel has no accessibility violations", async () => {
  const user = userEvent.setup();
  const { container } = render(<DateRangePicker defaultValue={range} />);
  await openPanel(user);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("DateRangePicker shows a placeholder until a range is chosen", () => {
  render(<DateRangePicker />);
  expect(screen.getByRole("button", { name: "Date range" })).toHaveTextContent("Pick a date range");
});

test("DateRangePicker writes the selected range on the trigger", () => {
  render(<DateRangePicker defaultValue={range} />);
  expect(screen.getByRole("button", { name: "Date range" })).toHaveTextContent(
    /Jan 5, 2026\s*–\s*Jan 19, 2026/,
  );
});

test("DateRangePicker collapses a single-day range to one date", () => {
  const day = new Date(2026, 0, 5);
  render(<DateRangePicker defaultValue={{ from: day, to: day }} />);
  expect(screen.getByRole("button", { name: "Date range" })).toHaveTextContent("Jan 5, 2026");
});

test("DateRangePicker honors a custom value formatter", () => {
  render(<DateRangePicker defaultValue={range} formatValue={() => "Custom label"} />);
  expect(screen.getByRole("button", { name: "Date range" })).toHaveTextContent("Custom label");
});

test("DateRangePicker's size prop actually changes the trigger's size classes", () => {
  render(<DateRangePicker defaultValue={range} size="sm" />);
  const trigger = screen.getByRole("button", { name: "Date range" });
  // The real regression this guards: passing `size` used to require a
  // `className="h-8 ..."` override that only ever *added* to the
  // trigger's hardcoded `buttonVariants({ size: "md" })` classes rather
  // than replacing them — leaving both "h-8" and "h-10" present at once
  // and letting Tailwind's cascade order (not this prop) decide which
  // actually won.
  expect(trigger).toHaveClass("h-8");
  expect(trigger).not.toHaveClass("h-10");
});

test("DateRangePicker renders its presets as a real radio group", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker />);
  await openPanel(user);

  const group = screen.getByRole("radiogroup", { name: "Preset ranges" });
  expect(within(group).getAllByRole("radio")).toHaveLength(defaultDateRangePresets.length);
  expect(within(group).getByRole("radio", { name: "Last 30 days" })).toBeInTheDocument();
});

test("DateRangePicker selecting a preset reports the computed range", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<DateRangePicker onValueChange={onValueChange} />);
  await openPanel(user);
  await user.click(screen.getByRole("radio", { name: "Last 7 days" }));

  expect(onValueChange).toHaveBeenCalledTimes(1);
  const [next] = onValueChange.mock.calls[0] as [DateRange];
  const spanInDays = Math.round((next.to.getTime() - next.from.getTime()) / 86_400_000);
  expect(spanInDays).toBe(6);
});

test("DateRangePicker checks the preset row matching the current range", async () => {
  const user = userEvent.setup();
  const lastSeven = defaultDateRangePresets[0].getRange();
  render(<DateRangePicker value={lastSeven} />);
  await openPanel(user);

  expect(screen.getByRole("radio", { name: "Last 7 days" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Last 30 days" })).not.toBeChecked();
});

test("DateRangePicker checks no preset for a hand-picked custom range", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker value={range} />);
  await openPanel(user);

  for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
});

test("DateRangePicker computes a preset on selection rather than at render", async () => {
  const user = userEvent.setup();
  const getRange = vi.fn(() => range);
  render(<DateRangePicker presets={[{ label: "Fixed", getRange }]} />);

  await openPanel(user);
  const callsBeforeSelecting = getRange.mock.calls.length;
  await user.click(screen.getByRole("radio", { name: "Fixed" }));

  expect(getRange.mock.calls.length).toBeGreaterThan(callsBeforeSelecting);
});

test("DateRangePicker renders a labelled calendar per endpoint", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker defaultValue={range} />);
  await openPanel(user);

  expect(screen.getByText("Start")).toBeVisible();
  expect(screen.getByText("End")).toBeVisible();
});

test("DateRangePicker drops the preset list when given none", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker presets={[]} defaultValue={range} />);
  await openPanel(user);

  expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  expect(screen.getByText("Start")).toBeVisible();
});

test("DateRangePicker blocks end dates before the start, so the range can't invert", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker defaultValue={{ from: new Date(2026, 0, 15), to: new Date(2026, 0, 20) }} />);
  await openPanel(user);

  // The second grid is the end date's. Calendar puts `role="gridcell"` on
  // the day button itself, so the cell *is* the control being disabled.
  const endGrid = screen.getAllByRole("grid")[1];
  expect(within(endGrid).getByRole("gridcell", { name: /^10\b/ })).toBeDisabled();
  expect(within(endGrid).getByRole("gridcell", { name: /^25\b/ })).not.toBeDisabled();
});

test("DateRangePicker respects a caller's own disabled predicate", async () => {
  const user = userEvent.setup();
  render(
    <DateRangePicker
      defaultValue={range}
      // Block everything after the 10th of any month.
      disabled={(date) => date.getDate() > 10}
    />,
  );
  await openPanel(user);

  const startGrid = screen.getAllByRole("grid")[0];
  expect(within(startGrid).getByRole("gridcell", { name: /^12\b/ })).toBeDisabled();
});

test("DateRangePicker's calendars jump to a preset's month, not just seed their initial one", async () => {
  const user = userEvent.setup();
  const juneRange: DateRange = { from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) };
  render(
    <DateRangePicker
      defaultValue={range} // January 2026, per the fixture above
      presets={[{ label: "June", getRange: () => juneRange }]}
    />,
  );
  await openPanel(user);

  await user.click(screen.getByRole("radio", { name: "June" }));

  // Both grids started on January (`range`'s month) — a `defaultMonth`
  // only seeds Calendar's *initial* display and is ignored after that, so
  // this only passes if the picker is actually re-syncing each Calendar's
  // month from the outside when `range` changes for a reason other than
  // paging through it by hand.
  const juneLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(juneRange.from);
  expect(screen.getAllByRole("grid", { name: juneLabel })).toHaveLength(2);
});

test("DateRangePicker stays uncontrolled when given only a default", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker defaultValue={range} />);
  await openPanel(user);
  await user.click(screen.getByRole("radio", { name: "Last 7 days" }));

  expect(screen.getByRole("radio", { name: "Last 7 days" })).toBeChecked();
});

test("DateRangePicker leaves a controlled value alone until the caller updates it", async () => {
  const user = userEvent.setup();
  render(<DateRangePicker value={range} onValueChange={() => {}} />);
  await openPanel(user);
  await user.click(screen.getByRole("radio", { name: "Last 7 days" }));

  expect(screen.getByRole("button", { name: "Date range" })).toHaveTextContent(
    /Jan 5, 2026\s*–\s*Jan 19, 2026/,
  );
});
