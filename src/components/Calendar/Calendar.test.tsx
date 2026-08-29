import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Calendar } from "./Calendar";

expect.extend(toHaveNoViolations);

// January 2024: Jan 1 is a Monday, Jan 31 is a Wednesday — a fixed,
// fully-known month so every test here is deterministic regardless of
// when it actually runs, rather than depending on `new Date()`.
const JAN_2024 = new Date(2024, 0, 1);
const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(JAN_2024);

test("Calendar renders with no accessibility violations", async () => {
  const { container } = render(<Calendar month={JAN_2024} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders a role=grid labeled with the current month and year", () => {
  render(<Calendar month={JAN_2024} />);
  expect(screen.getByRole("grid", { name: monthLabel })).toBeInTheDocument();
});

test("renders 7 weekday column headers", () => {
  render(<Calendar month={JAN_2024} />);
  expect(screen.getAllByRole("columnheader")).toHaveLength(7);
});

test("clicking a day selects it and calls onSelect", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Calendar month={JAN_2024} onSelect={onSelect} />);

  await user.click(screen.getByRole("gridcell", { name: "15" }));

  expect(onSelect).toHaveBeenCalledOnce();
  const selected = onSelect.mock.calls[0][0] as Date;
  expect(selected.getFullYear()).toBe(2024);
  expect(selected.getMonth()).toBe(0);
  expect(selected.getDate()).toBe(15);
});

test("the selected day is marked aria-selected", () => {
  render(<Calendar month={JAN_2024} selected={new Date(2024, 0, 15)} />);
  expect(screen.getByRole("gridcell", { name: "15" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("gridcell", { name: "16" })).toHaveAttribute("aria-selected", "false");
});

test("defaultSelected pre-selects without a controlled selected prop", () => {
  render(<Calendar month={JAN_2024} defaultSelected={new Date(2024, 0, 15)} />);
  expect(screen.getByRole("gridcell", { name: "15" })).toHaveAttribute("aria-selected", "true");
});

test("a controlled Calendar only reflects the selected prop, not its own clicks", async () => {
  const user = userEvent.setup();
  render(<Calendar month={JAN_2024} selected={new Date(2024, 0, 15)} onSelect={() => {}} />);

  await user.click(screen.getByRole("gridcell", { name: "16" }));

  // Still 15 — a controlled Calendar's displayed selection only changes
  // when the `selected` prop itself does, the same as a controlled Select.
  expect(screen.getByRole("gridcell", { name: "15" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("gridcell", { name: "16" })).toHaveAttribute("aria-selected", "false");
});

test("disabled dates can't be selected and render as disabled", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Calendar month={JAN_2024} disabled={(date) => date.getDate() === 15} onSelect={onSelect} />);

  const day15 = screen.getByRole("gridcell", { name: "15" });
  expect(day15).toBeDisabled();

  await user.click(day15);
  expect(onSelect).not.toHaveBeenCalled();
});

test("today gets aria-current=date", () => {
  const today = new Date();
  render(<Calendar month={today} />);
  // getByRole (singular) breaks whenever today's day-of-month also appears
  // as a leading/trailing day from an adjacent month (e.g. today the 29th,
  // with the grid's last row spilling into the 29th of next month) — which
  // is most months, not an edge case. aria-current is what's actually under
  // test, so find the cell that has it rather than assuming the day number
  // alone is unique on the grid.
  const todaysCell = screen
    .getAllByRole("gridcell", { name: String(today.getDate()) })
    .find((cell) => cell.getAttribute("aria-current") === "date");
  expect(todaysCell).toBeDefined();
});

test("the previous/next month buttons navigate and report onMonthChange", async () => {
  const user = userEvent.setup();
  const onMonthChange = vi.fn();
  render(<Calendar defaultMonth={JAN_2024} onMonthChange={onMonthChange} />);

  await user.click(screen.getByRole("button", { name: "Next month" }));
  const nextLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    new Date(2024, 1, 1),
  );
  expect(screen.getByRole("grid", { name: nextLabel })).toBeInTheDocument();
  const reportedMonth = onMonthChange.mock.calls[0][0] as Date;
  expect(reportedMonth.getMonth()).toBe(1);

  await user.click(screen.getByRole("button", { name: "Previous month" }));
  await user.click(screen.getByRole("button", { name: "Previous month" }));
  const prevLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    new Date(2023, 11, 1),
  );
  expect(screen.getByRole("grid", { name: prevLabel })).toBeInTheDocument();
});

test("only one day is in the tab order at a time (roving tabindex)", () => {
  render(<Calendar month={JAN_2024} defaultSelected={new Date(2024, 0, 15)} />);
  const focusable = screen.getAllByRole("gridcell").filter((cell) => cell.getAttribute("tabindex") === "0");
  expect(focusable).toHaveLength(1);
  // Roving focus starts on the selected day when there is one.
  expect(focusable[0]).toHaveTextContent("15");
});

test("ArrowRight/ArrowLeft move focus a day at a time", async () => {
  const user = userEvent.setup();
  render(<Calendar month={JAN_2024} defaultSelected={new Date(2024, 0, 15)} />);
  screen.getByRole("gridcell", { name: "15" }).focus();

  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("gridcell", { name: "16" })).toHaveFocus();

  await user.keyboard("{ArrowLeft}");
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("gridcell", { name: "14" })).toHaveFocus();
});

test("ArrowDown/ArrowUp move focus a week at a time", async () => {
  const user = userEvent.setup();
  render(<Calendar month={JAN_2024} defaultSelected={new Date(2024, 0, 15)} />);
  screen.getByRole("gridcell", { name: "15" }).focus();

  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("gridcell", { name: "22" })).toHaveFocus();

  await user.keyboard("{ArrowUp}");
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("gridcell", { name: "8" })).toHaveFocus();
});

test("Home/End move focus to the start/end of the current week", async () => {
  const user = userEvent.setup();
  // Jan 15, 2024 is a Monday; with the default Sunday week start its row
  // runs Sun the 14th through Sat the 20th.
  render(<Calendar month={JAN_2024} defaultSelected={new Date(2024, 0, 15)} />);
  screen.getByRole("gridcell", { name: "15" }).focus();

  await user.keyboard("{Home}");
  expect(screen.getByRole("gridcell", { name: "14" })).toHaveFocus();

  await user.keyboard("{End}");
  expect(screen.getByRole("gridcell", { name: "20" })).toHaveFocus();
});

test("PageDown/PageUp move focus by a month, clamping the day of month", async () => {
  const user = userEvent.setup();
  render(<Calendar defaultMonth={new Date(2024, 0, 1)} defaultSelected={new Date(2024, 0, 31)} />);
  // Only Jan 31 (not any leading/trailing day from an adjacent month) is
  // both selected and in the tab order.
  screen.getByRole("gridcell", { name: "31", selected: true }).focus();

  // February 2024 (a leap year) has 29 days — Jan 31 clamps to Feb 29, not
  // overflowing into March.
  await user.keyboard("{PageDown}");
  const febLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    new Date(2024, 1, 1),
  );
  expect(screen.getByRole("grid", { name: febLabel })).toBeInTheDocument();
  // Two "29"s are on screen (Feb 29 itself, plus a leading day from
  // January's last week) — the focused one is unambiguous.
  const feb29 = screen.getAllByRole("gridcell", { name: "29" }).find((cell) => cell === document.activeElement);
  expect(feb29).toBeDefined();
});

test("Enter and Space select the focused day", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Calendar month={JAN_2024} onSelect={onSelect} />);
  const day10 = screen.getByRole("gridcell", { name: "10" });
  day10.focus();

  await user.keyboard("{Enter}");
  expect(onSelect).toHaveBeenCalledOnce();
  expect((onSelect.mock.calls[0][0] as Date).getDate()).toBe(10);

  await user.keyboard(" ");
  expect(onSelect).toHaveBeenCalledTimes(2);
});

test("arrow-key navigation skips over disabled dates instead of landing on one", async () => {
  const user = userEvent.setup();
  render(<Calendar month={JAN_2024} defaultSelected={new Date(2024, 0, 14)} disabled={(date) => date.getDate() === 15} />);
  screen.getByRole("gridcell", { name: "14" }).focus();

  await user.keyboard("{ArrowRight}");
  // Landed past the 15th, not on it — a disabled button can never actually
  // hold focus, so roving focus must skip it entirely.
  expect(screen.getByRole("gridcell", { name: "16" })).toHaveFocus();
});

test("selecting a day outside the displayed month switches to that day's month", async () => {
  const user = userEvent.setup();
  const onMonthChange = vi.fn();
  render(<Calendar month={JAN_2024} onMonthChange={onMonthChange} />);

  // The grid's first row includes trailing December days before Jan 1.
  const day31 = screen.getAllByRole("gridcell", { name: "31" })[0];
  await user.click(day31);

  expect(onMonthChange).toHaveBeenCalledOnce();
  expect((onMonthChange.mock.calls[0][0] as Date).getMonth()).toBe(11);
});

test("a day outside the displayed month is styled muted, not like a current-month day", () => {
  render(<Calendar month={JAN_2024} />);
  // The grid's first row includes trailing December days before Jan 1.
  const dec31 = screen.getAllByRole("gridcell", { name: "31" })[0];
  expect(dec31).toHaveClass("text-slate-400");
  expect(dec31).not.toHaveClass("text-slate-950");
});

test("Calendar merges a custom className with its defaults", () => {
  render(<Calendar month={JAN_2024} className="custom-calendar" data-testid="cal" />);
  expect(screen.getByTestId("cal")).toHaveClass("custom-calendar", "w-fit");
});

test("Calendar forwards its ref to the outer element", () => {
  const ref = createRef<HTMLDivElement>();
  render(<Calendar month={JAN_2024} ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
