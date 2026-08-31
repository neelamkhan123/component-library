import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Textarea } from "./Textarea";

expect.extend(toHaveNoViolations);

test("Textarea renders with no accessibility violations", async () => {
  const { container } = render(
    <label>
      Bio
      <Textarea />
    </label>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Textarea renders as a native textarea", () => {
  render(<Textarea aria-label="Bio" />);
  const textarea = screen.getByRole("textbox", { name: "Bio" });
  expect(textarea.tagName).toBe("TEXTAREA");
});

test("defaults to 3 rows", () => {
  render(<Textarea aria-label="Bio" />);
  expect(screen.getByRole("textbox", { name: "Bio" })).toHaveAttribute("rows", "3");
});

test("rows can be overridden", () => {
  render(<Textarea aria-label="Bio" rows={6} />);
  expect(screen.getByRole("textbox", { name: "Bio" })).toHaveAttribute("rows", "6");
});

test("typing updates an uncontrolled Textarea's value, including newlines", async () => {
  const user = userEvent.setup();
  render(<Textarea aria-label="Bio" />);
  const textarea = screen.getByRole("textbox", { name: "Bio" });

  await user.type(textarea, "Line one{enter}Line two");

  expect(textarea).toHaveValue("Line one\nLine two");
});

test("a disabled Textarea can't be typed into", async () => {
  const user = userEvent.setup();
  render(<Textarea aria-label="Bio" disabled />);
  const textarea = screen.getByRole("textbox", { name: "Bio" });

  expect(textarea).toBeDisabled();
  await user.type(textarea, "hello");
  expect(textarea).toHaveValue("");
});

test("clicking an associated label focuses the textarea natively", async () => {
  const user = userEvent.setup();
  render(
    <label>
      Bio
      <Textarea />
    </label>,
  );

  await user.click(screen.getByText("Bio"));

  expect(screen.getByRole("textbox")).toHaveFocus();
});

test("aria-invalid is forwarded for styling and announced to assistive tech", () => {
  render(<Textarea aria-label="Bio" aria-invalid="true" />);
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("Textarea merges a custom className with its defaults", () => {
  render(<Textarea aria-label="Bio" className="custom-textarea" />);
  expect(screen.getByRole("textbox")).toHaveClass("custom-textarea", "rounded-xl");
});

test("Textarea forwards its ref to the underlying element", () => {
  const textareaRef = createRef<HTMLTextAreaElement>();
  render(<Textarea ref={textareaRef} aria-label="Bio" />);
  expect(textareaRef.current).toBeInstanceOf(HTMLTextAreaElement);
});
