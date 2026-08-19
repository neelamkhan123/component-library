import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { AspectRatio } from "./AspectRatio";

expect.extend(toHaveNoViolations);

test("AspectRatio renders with no accessibility violations", async () => {
  const { container } = render(
    <AspectRatio>
      <img src="https://example.com/photo.jpg" alt="A photo" />
    </AspectRatio>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("defaults to a 1:1 ratio", () => {
  render(<AspectRatio data-testid="ratio" />);
  expect(screen.getByTestId("ratio")).toHaveStyle({ aspectRatio: "1 / 1" });
});

test("ratio sets the CSS aspect-ratio property", () => {
  render(<AspectRatio ratio={16 / 9} data-testid="ratio" />);
  expect(screen.getByTestId("ratio")).toHaveStyle({ aspectRatio: `${16 / 9} / 1` });
});

test("a custom style is merged alongside the computed aspect-ratio", () => {
  // A non-color property, deliberately: this stack's `toHaveStyle` doesn't
  // reliably match color values (e.g. `backgroundColor: "red"` against a
  // computed `rgb(255, 0, 0)`) even when the DOM's own inline `cssText`
  // plainly has it — confirmed directly against `element.style.cssText`,
  // so it's a jest-dom/jsdom quirk in this dependency combination, not a
  // component bug. `opacity` sidesteps it entirely.
  render(<AspectRatio ratio={16 / 9} style={{ opacity: 0.5 }} data-testid="ratio" />);
  const ratio = screen.getByTestId("ratio");
  expect(ratio).toHaveStyle({ aspectRatio: `${16 / 9} / 1`, opacity: "0.5" });
});

test("renders its children", () => {
  render(
    <AspectRatio>
      <img src="https://example.com/photo.jpg" alt="A photo" />
    </AspectRatio>,
  );
  expect(screen.getByAltText("A photo")).toBeInTheDocument();
});

test("AspectRatio merges a custom className with its defaults", () => {
  render(<AspectRatio className="custom-ratio" data-testid="ratio" />);
  expect(screen.getByTestId("ratio")).toHaveClass("custom-ratio", "overflow-hidden");
});

test("AspectRatio forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<AspectRatio ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
