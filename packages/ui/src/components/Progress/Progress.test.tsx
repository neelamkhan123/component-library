import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Progress } from "./Progress";

expect.extend(toHaveNoViolations);

test("Progress renders with no accessibility violations", async () => {
  const { container } = render(<Progress value={50} aria-label="Upload progress" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("indeterminate Progress renders with no accessibility violations", async () => {
  const { container } = render(<Progress aria-label="Loading" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders role=progressbar with the given value exposed", () => {
  render(<Progress value={50} aria-label="Upload progress" />);
  const bar = screen.getByRole("progressbar", { name: "Upload progress" });
  expect(bar).toHaveAttribute("aria-valuenow", "50");
  expect(bar).toHaveAttribute("aria-valuemin", "0");
  expect(bar).toHaveAttribute("aria-valuemax", "100");
});

test("max changes the upper bound reported to assistive tech", () => {
  render(<Progress value={3} max={5} aria-label="Steps completed" />);
  const bar = screen.getByRole("progressbar", { name: "Steps completed" });
  expect(bar).toHaveAttribute("aria-valuemax", "5");
  expect(bar).toHaveAttribute("aria-valuenow", "3");
});

test("an omitted value renders as indeterminate, with no aria-valuenow", () => {
  render(<Progress aria-label="Loading" />);
  const bar = screen.getByRole("progressbar", { name: "Loading" });
  expect(bar).not.toHaveAttribute("aria-valuenow");
});

test("value is clamped to the 0..max range", () => {
  render(<Progress value={150} aria-label="Overshoot" />);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

  render(<Progress value={-20} aria-label="Undershoot" />);
  expect(screen.getByRole("progressbar", { name: "Undershoot" })).toHaveAttribute("aria-valuenow", "0");
});

test("the fill's width tracks value as a percentage of max", () => {
  const { container } = render(<Progress value={25} max={50} aria-label="Halfway" />);
  const fill = container.querySelector('[role="progressbar"] > div');
  expect(fill).toHaveStyle({ width: "50%" });
});

test("Progress merges a custom className with its defaults", () => {
  render(<Progress value={50} aria-label="Upload progress" className="custom-progress" />);
  expect(screen.getByRole("progressbar")).toHaveClass("custom-progress", "rounded-full");
});

test("Progress forwards its ref to the outer element", () => {
  const progressRef = createRef<HTMLDivElement>();
  render(<Progress ref={progressRef} value={50} aria-label="Upload progress" />);
  expect(progressRef.current).toBeInstanceOf(HTMLDivElement);
});
