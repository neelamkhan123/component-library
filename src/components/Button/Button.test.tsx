import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Button } from "./Button";

expect.extend(toHaveNoViolations);

test("Button renders with no accessibility violations", async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Disabled button has no accessibility violations", async () => {
  const { container } = render(<Button disabled>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
