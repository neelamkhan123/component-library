import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Separator } from "./Separator";

expect.extend(toHaveNoViolations);

test("Separator renders with no accessibility violations", async () => {
  const { container } = render(<Separator />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders a native <hr>", () => {
  render(<Separator data-testid="sep" />);
  expect(screen.getByTestId("sep").tagName).toBe("HR");
});

test("decorative (the default) hides it from assistive tech", () => {
  render(<Separator data-testid="sep" />);
  expect(screen.getByTestId("sep")).toHaveAttribute("aria-hidden", "true");
  expect(screen.queryByRole("separator")).not.toBeInTheDocument();
});

test("decorative={false} exposes it as a separator", () => {
  render(<Separator decorative={false} />);
  expect(screen.getByRole("separator")).not.toHaveAttribute("aria-hidden");
});

test("decorative={false} sets aria-orientation only for the vertical case", () => {
  const { rerender } = render(<Separator decorative={false} />);
  expect(screen.getByRole("separator")).not.toHaveAttribute("aria-orientation");

  rerender(<Separator decorative={false} orientation="vertical" />);
  expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
});

test("orientation=vertical never carries aria-orientation once decorative (the default)", () => {
  render(<Separator orientation="vertical" data-testid="sep" />);
  expect(screen.getByTestId("sep")).not.toHaveAttribute("aria-orientation");
});

test("horizontal (the default) spans full width; vertical stretches and is a hairline", () => {
  const { rerender } = render(<Separator data-testid="sep" />);
  expect(screen.getByTestId("sep")).toHaveClass("w-full", "h-px");

  rerender(<Separator orientation="vertical" data-testid="sep" />);
  expect(screen.getByTestId("sep")).toHaveClass("w-px", "self-stretch");
});

test("Separator merges a custom className with its defaults", () => {
  render(<Separator className="custom-separator" data-testid="sep" />);
  expect(screen.getByTestId("sep")).toHaveClass("custom-separator", "shrink-0");
});

test("Separator forwards its ref", () => {
  const ref = createRef<HTMLHRElement>();
  render(<Separator ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLHRElement);
});
