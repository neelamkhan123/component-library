import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Toggle } from "./Toggle";

expect.extend(toHaveNoViolations);

test("Toggle renders with no accessibility violations", async () => {
  const { container } = render(<Toggle aria-label="Bold">B</Toggle>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Toggle renders as a native button with aria-pressed", () => {
  render(<Toggle aria-label="Bold">B</Toggle>);
  const toggle = screen.getByRole("button", { name: "Bold" });
  expect(toggle.tagName).toBe("BUTTON");
  expect(toggle).toHaveAttribute("type", "button");
  expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("clicking toggles aria-pressed", async () => {
  const user = userEvent.setup();
  render(<Toggle aria-label="Bold">B</Toggle>);
  const toggle = screen.getByRole("button", { name: "Bold" });

  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "true");

  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("defaultPressed sets the initial uncontrolled state", () => {
  render(
    <Toggle aria-label="Bold" defaultPressed>
      B
    </Toggle>,
  );
  expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
});

test("Space and Enter toggle a focused Toggle, per native button activation", async () => {
  const user = userEvent.setup();
  render(<Toggle aria-label="Bold">B</Toggle>);
  const toggle = screen.getByRole("button", { name: "Bold" });

  toggle.focus();
  await user.keyboard(" ");
  expect(toggle).toHaveAttribute("aria-pressed", "true");

  await user.keyboard("{Enter}");
  expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("controlled Toggle reports changes via onPressedChange without toggling itself", async () => {
  const user = userEvent.setup();
  const onPressedChange = vi.fn();
  render(
    <Toggle aria-label="Bold" pressed={false} onPressedChange={onPressedChange}>
      B
    </Toggle>,
  );

  await user.click(screen.getByRole("button", { name: "Bold" }));

  expect(onPressedChange).toHaveBeenCalledExactlyOnceWith(true);
  // Stays false: the caller controls `pressed` and didn't change it here.
  expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
});

test("a disabled Toggle can't be toggled", async () => {
  const user = userEvent.setup();
  const onPressedChange = vi.fn();
  render(
    <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange}>
      B
    </Toggle>,
  );

  const toggle = screen.getByRole("button", { name: "Bold" });
  expect(toggle).toBeDisabled();

  await user.click(toggle);
  expect(onPressedChange).not.toHaveBeenCalled();
});

test("Toggle merges a custom className with its defaults", () => {
  render(
    <Toggle aria-label="Bold" className="custom-toggle">
      B
    </Toggle>,
  );
  expect(screen.getByRole("button", { name: "Bold" })).toHaveClass("custom-toggle", "rounded-lg");
});

test("Toggle forwards its ref to the underlying button", () => {
  const toggleRef = createRef<HTMLButtonElement>();
  render(
    <Toggle ref={toggleRef} aria-label="Bold">
      B
    </Toggle>,
  );
  expect(toggleRef.current).toBeInstanceOf(HTMLButtonElement);
});
