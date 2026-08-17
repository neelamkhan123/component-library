import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Input } from "./Input";

expect.extend(toHaveNoViolations);

test("Input renders with no accessibility violations", async () => {
  const { container } = render(
    <label>
      Email address
      <Input type="email" />
    </label>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Input renders as a native text input by default", () => {
  render(<Input aria-label="Name" />);
  const input = screen.getByRole("textbox", { name: "Name" });
  expect(input.tagName).toBe("INPUT");
  expect(input).toHaveAttribute("type", "text");
});

test("Input forwards `type` to the underlying element", () => {
  render(<Input type="email" aria-label="Email" />);
  expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("type", "email");
});

test("typing updates an uncontrolled Input's value", async () => {
  const user = userEvent.setup();
  render(<Input aria-label="Name" />);
  const input = screen.getByRole("textbox", { name: "Name" });

  await user.type(input, "Jane");

  expect(input).toHaveValue("Jane");
});

test("a disabled Input can't be typed into", async () => {
  const user = userEvent.setup();
  render(<Input aria-label="Name" disabled />);
  const input = screen.getByRole("textbox", { name: "Name" });

  expect(input).toBeDisabled();
  await user.type(input, "Jane");
  expect(input).toHaveValue("");
});

test("clicking an associated label focuses the input natively", async () => {
  const user = userEvent.setup();
  render(
    <label>
      Email address
      <Input />
    </label>,
  );

  await user.click(screen.getByText("Email address"));

  expect(screen.getByRole("textbox")).toHaveFocus();
});

test("aria-invalid is forwarded for styling and announced to assistive tech", () => {
  render(<Input aria-label="Email" aria-invalid="true" />);
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("size applies the expected height class", () => {
  render(
    <>
      <Input aria-label="Small" size="sm" />
      <Input aria-label="Medium" size="md" />
      <Input aria-label="Large" size="lg" />
    </>,
  );
  expect(screen.getByRole("textbox", { name: "Small" })).toHaveClass("h-8");
  expect(screen.getByRole("textbox", { name: "Medium" })).toHaveClass("h-10");
  expect(screen.getByRole("textbox", { name: "Large" })).toHaveClass("h-12");
});

test("Input merges a custom className with its defaults", () => {
  render(<Input aria-label="Name" className="custom-input" />);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass("custom-input", "rounded-xl");
});

test("Input forwards its ref to the underlying element", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(<Input ref={inputRef} aria-label="Name" />);
  expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
});
