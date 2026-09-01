import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Badge } from "./Badge";

expect.extend(toHaveNoViolations);

test("Badge renders with no accessibility violations", async () => {
  const { container } = render(<Badge>New</Badge>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders as a plain <span>", () => {
  render(<Badge>New</Badge>);
  expect(screen.getByText("New").tagName).toBe("SPAN");
});

test("defaults to the default variant", () => {
  render(<Badge>New</Badge>);
  expect(screen.getByText("New")).toHaveClass("bg-slate-950");
});

test.each([
  ["secondary", "bg-slate-100"],
  ["outline", "border-slate-200"],
  ["destructive", "bg-red-50"],
] as const)("variant=%s applies its styling", (variant, expectedClass) => {
  render(<Badge variant={variant}>New</Badge>);
  expect(screen.getByText("New")).toHaveClass(expectedClass);
});

test("Badge merges a custom className with its defaults", () => {
  render(<Badge className="custom-badge">New</Badge>);
  expect(screen.getByText("New")).toHaveClass("custom-badge", "rounded-full");
});

test("Badge forwards its ref", () => {
  const ref = createRef<HTMLSpanElement>();
  render(<Badge ref={ref}>New</Badge>);
  expect(ref.current).toBeInstanceOf(HTMLSpanElement);
});
