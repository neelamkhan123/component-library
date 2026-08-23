import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Sparkline } from "./Sparkline";

expect.extend(toHaveNoViolations);

const series = [4, 8, 6, 12, 9, 15];

test("Sparkline renders with no accessibility violations", async () => {
  const { container } = render(<Sparkline data={series} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Sparkline is decorative by default", () => {
  const { container } = render(<Sparkline data={series} />);
  const svg = container.querySelector("svg");
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(svg).not.toHaveAttribute("role");
});

test("Sparkline given a label exposes itself as a named image", () => {
  render(<Sparkline data={series} label="Response time over 6 weeks" />);
  expect(screen.getByRole("img", { name: "Response time over 6 weeks" })).toBeInTheDocument();
});

test("Sparkline renders nothing for fewer than two points", () => {
  const { container } = render(<Sparkline data={[7]} />);
  expect(container.querySelector("svg")).not.toBeInTheDocument();
});

test("Sparkline plots one point per value across the full width", () => {
  const { container } = render(<Sparkline data={[0, 10, 5]} width={100} height={20} />);
  const polyline = container.querySelector("polyline");
  const points = polyline?.getAttribute("points")?.split(" ") ?? [];
  expect(points).toHaveLength(3);
  expect(points[0].startsWith("0,")).toBe(true);
  expect(points[2].startsWith("100,")).toBe(true);
});

test("Sparkline centers a flat series rather than dividing by a zero range", () => {
  const { container } = render(<Sparkline data={[5, 5, 5]} height={20} />);
  const points = container.querySelector("polyline")?.getAttribute("points") ?? "";
  // Every y is the vertical midpoint, and crucially none of them is NaN.
  expect(points).toBe("0,10 48,10 96,10");
});

test("Sparkline bar variant renders one rect per value", () => {
  const { container } = render(<Sparkline data={series} variant="bar" />);
  expect(container.querySelectorAll("rect")).toHaveLength(series.length);
});

test("Sparkline draws an end point only when asked", () => {
  const { container: without } = render(<Sparkline data={series} />);
  expect(without.querySelector("circle")).not.toBeInTheDocument();

  const { container: with_ } = render(<Sparkline data={series} showEndPoint />);
  expect(with_.querySelector("circle")).toBeInTheDocument();
});

test("Sparkline merges a custom className with its defaults", () => {
  const { container } = render(<Sparkline data={series} className="text-blue-600" />);
  expect(container.querySelector("svg")).toHaveClass("text-blue-600", "overflow-visible");
});

test("Sparkline forwards its ref to the underlying svg element", () => {
  const ref = createRef<SVGSVGElement>();
  render(<Sparkline ref={ref} data={series} />);
  expect(ref.current).toBeInstanceOf(SVGElement);
});
