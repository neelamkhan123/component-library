import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Bubble } from "./Bubble";

expect.extend(toHaveNoViolations);

test("Bubble renders with no accessibility violations", async () => {
  const { container } = render(<Bubble>Hello there</Bubble>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("defaults to incoming and does not self-align right", () => {
  render(<Bubble>Hello</Bubble>);
  expect(screen.getByText("Hello")).not.toHaveClass("ml-auto");
});

test("an outgoing Bubble aligns itself to the right", () => {
  render(<Bubble variant="outgoing">Hello</Bubble>);
  expect(screen.getByText("Hello")).toHaveClass("ml-auto");
});

test("Bubble merges a custom className with its defaults", () => {
  render(<Bubble className="custom-bubble">Hello</Bubble>);
  expect(screen.getByText("Hello")).toHaveClass("custom-bubble", "rounded-2xl");
});

test("Bubble forwards its ref to the underlying element", () => {
  const bubbleRef = createRef<HTMLDivElement>();
  render(<Bubble ref={bubbleRef}>Hello</Bubble>);
  expect(bubbleRef.current).toBeInstanceOf(HTMLDivElement);
});
