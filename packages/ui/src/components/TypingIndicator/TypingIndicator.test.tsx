import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { TypingIndicator } from "./TypingIndicator";

expect.extend(toHaveNoViolations);

test("TypingIndicator renders with no accessibility violations", async () => {
  const { container } = render(<TypingIndicator />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders role=status, announced via aria-label", () => {
  render(<TypingIndicator />);
  expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Typing…");
});

test("label overrides the default announcement", () => {
  render(<TypingIndicator label="Jane is typing…" />);
  expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Jane is typing…");
});

test("renders three decorative dots, hidden from assistive tech individually", () => {
  const { container } = render(<TypingIndicator />);
  const dots = container.querySelectorAll('[aria-hidden="true"]');
  expect(dots).toHaveLength(3);
});

test("TypingIndicator merges a custom className with its defaults", () => {
  render(<TypingIndicator className="custom-typing" />);
  expect(screen.getByRole("status")).toHaveClass("custom-typing", "rounded-2xl");
});

test("TypingIndicator forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<TypingIndicator ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
