import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Skeleton } from "./Skeleton";

expect.extend(toHaveNoViolations);

test("Skeleton renders with no accessibility violations", async () => {
  const { container } = render(<Skeleton className="h-4 w-32" data-testid="skeleton" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders as a plain <div>, hidden from assistive tech", () => {
  render(<Skeleton data-testid="skeleton" />);
  const skeleton = screen.getByTestId("skeleton");
  expect(skeleton.tagName).toBe("DIV");
  expect(skeleton).toHaveAttribute("aria-hidden", "true");
});

test("imposes no default size", () => {
  render(<Skeleton data-testid="skeleton" />);
  expect(screen.getByTestId("skeleton").className).not.toMatch(/\bh-\d|\bw-\d/);
});

test("Skeleton merges a custom className with its defaults", () => {
  render(<Skeleton className="h-4 w-32" data-testid="skeleton" />);
  expect(screen.getByTestId("skeleton")).toHaveClass("h-4", "w-32", "animate-pulse");
});

test("Skeleton forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<Skeleton ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
