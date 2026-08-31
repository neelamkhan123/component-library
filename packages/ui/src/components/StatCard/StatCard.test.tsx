import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { StatCard } from "./StatCard";

expect.extend(toHaveNoViolations);

test("StatCard renders with no accessibility violations", async () => {
  const { container } = render(
    <StatCard
      label="Avg. response time"
      value="190 ms"
      delta={-0.124}
      deltaLabel="vs. previous 30 days"
      deltaDirection="down-is-good"
      trend={[420, 388, 352, 318, 268, 232, 190]}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("StatCard renders its label and value", () => {
  render(<StatCard label="Active users" value="1,284" />);
  expect(screen.getByText("Active users")).toBeVisible();
  expect(screen.getByText("1,284")).toBeVisible();
});

test("StatCard omits the delta entirely when none is given", () => {
  render(<StatCard label="Active users" value="1,284" />);
  expect(screen.queryByText(/Increased by|Decreased by|No change/)).not.toBeInTheDocument();
});

test("StatCard formats a delta as a signed percentage by default", () => {
  render(<StatCard label="Signups" value="42" delta={0.124} />);
  expect(screen.getByText("+12.4%")).toBeVisible();
});

test("StatCard drops a trailing zero from a whole-number delta", () => {
  render(<StatCard label="Signups" value="42" delta={0.1} />);
  expect(screen.getByText("+10%")).toBeVisible();
});

test("StatCard honors a custom delta formatter", () => {
  render(<StatCard label="Team members" value="18" delta={3} formatDelta={(d) => `${d} more`} />);
  expect(screen.getByText("3 more")).toBeVisible();
});

test("StatCard states the delta's direction in text, not by color alone", () => {
  const { rerender } = render(<StatCard label="Signups" value="42" delta={0.12} />);
  expect(screen.getByText("Increased by")).toBeInTheDocument();

  rerender(<StatCard label="Signups" value="42" delta={-0.12} />);
  expect(screen.getByText("Decreased by")).toBeInTheDocument();

  rerender(<StatCard label="Signups" value="42" delta={0} />);
  expect(screen.getByText("No change")).toBeInTheDocument();
});

test("StatCard colors a rise as good news when up is good", () => {
  render(<StatCard label="Signups" value="42" delta={0.12} deltaDirection="up-is-good" />);
  expect(screen.getByText("Increased by").parentElement).toHaveClass("text-green-700");
});

test("StatCard colors the same rise as bad news when down is good", () => {
  render(<StatCard label="Avg. response time" value="190 ms" delta={0.12} deltaDirection="down-is-good" />);
  expect(screen.getByText("Increased by").parentElement).toHaveClass("text-red-700");
});

test("StatCard leaves a rise uncolored when neither direction is good news", () => {
  render(<StatCard label="Active users" value="1,284" delta={0.12} deltaDirection="neutral" />);
  expect(screen.getByText("Increased by").parentElement).toHaveClass("text-slate-500");
});

test("StatCard treats a flat delta as neutral regardless of direction", () => {
  render(<StatCard label="Signups" value="42" delta={0} deltaDirection="up-is-good" />);
  expect(screen.getByText("No change").parentElement).toHaveClass("text-slate-500");
});

test("StatCard renders a decorative sparkline for a trend", () => {
  const { container } = render(<StatCard label="Signups" value="42" trend={[1, 4, 2, 8, 6]} />);
  const svg = container.querySelector("svg");
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute("aria-hidden", "true");
});

test("StatCard skips the sparkline for a trend too short to plot", () => {
  const { container } = render(<StatCard label="Signups" value="42" trend={[1]} />);
  expect(container.querySelector("svg")).not.toBeInTheDocument();
});

test("StatCard hides its icon from assistive tech", () => {
  render(<StatCard label="Signups" value="42" icon={<svg data-testid="icon" />} />);
  expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
});

test("StatCard merges a custom className with its defaults", () => {
  const { container } = render(<StatCard className="custom-stat" label="Signups" value="42" />);
  expect(container.firstChild).toHaveClass("custom-stat", "rounded-xl");
});

test("StatCard forwards its ref to the underlying div", () => {
  const ref = createRef<HTMLDivElement>();
  render(<StatCard ref={ref} label="Signups" value="42" />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
