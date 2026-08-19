import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Composer } from "./Composer";

expect.extend(toHaveNoViolations);

test("Composer renders with no accessibility violations", async () => {
  const { container } = render(<Composer placeholder="Type a message…" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders a textarea and a send button", () => {
  render(<Composer placeholder="Type a message…" />);
  expect(screen.getByPlaceholderText("Type a message…").tagName).toBe("TEXTAREA");
  expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
});

test("the send button is disabled while the field is empty or only whitespace", async () => {
  const user = userEvent.setup();
  render(<Composer />);
  const textarea = screen.getByRole("textbox");
  const button = screen.getByRole("button", { name: "Send message" });

  expect(button).toBeDisabled();
  await user.type(textarea, "   ");
  expect(button).toBeDisabled();
  await user.type(textarea, "hi");
  expect(button).toBeEnabled();
});

test("clicking the send button submits the trimmed value", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<Composer onSubmit={onSubmit} />);

  await user.type(screen.getByRole("textbox"), "  hello there  ");
  await user.click(screen.getByRole("button", { name: "Send message" }));

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("hello there");
});

test("Enter submits; Shift+Enter inserts a newline instead", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<Composer onSubmit={onSubmit} />);
  const textarea = screen.getByRole("textbox");

  await user.type(textarea, "line one");
  await user.keyboard("{Shift>}{Enter}{/Shift}");
  await user.type(textarea, "line two");
  expect(onSubmit).not.toHaveBeenCalled();
  expect(textarea).toHaveValue("line one\nline two");

  await user.keyboard("{Enter}");
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("line one\nline two");
});

test("an uncontrolled Composer clears itself after submitting", async () => {
  const user = userEvent.setup();
  render(<Composer />);
  const textarea = screen.getByRole("textbox");

  await user.type(textarea, "hello");
  await user.keyboard("{Enter}");

  expect(textarea).toHaveValue("");
});

test("a controlled Composer does not clear itself — that's left to the value prop", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<Composer value="hello" onValueChange={() => {}} onSubmit={onSubmit} />);
  const textarea = screen.getByRole("textbox");

  await user.click(textarea);
  await user.keyboard("{Enter}");

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("hello");
  expect(textarea).toHaveValue("hello");
});

test("submitting only whitespace does nothing", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<Composer onSubmit={onSubmit} />);
  const textarea = screen.getByRole("textbox");

  await user.type(textarea, "   ");
  await user.keyboard("{Enter}");

  expect(onSubmit).not.toHaveBeenCalled();
});

test("a disabled Composer can't be typed into, and its send button stays disabled", () => {
  render(<Composer disabled value="hi" onValueChange={() => {}} />);
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
});

test("sendLabel overrides the send button's accessible name", () => {
  render(<Composer sendLabel="Post reply" />);
  expect(screen.getByRole("button", { name: "Post reply" })).toBeInTheDocument();
});

test("Composer forwards its ref to the underlying textarea", () => {
  const ref = createRef<HTMLTextAreaElement>();
  render(<Composer ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
});
