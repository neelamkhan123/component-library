import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Switch } from "./Switch";

expect.extend(toHaveNoViolations);

test("Switch renders with no accessibility violations", async () => {
  const { container } = render(
    <label>
      <Switch />
      Enable notifications
    </label>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Switch renders as a native checkbox input with role=switch", () => {
  render(<Switch aria-label="Notifications" />);
  const toggle = screen.getByRole("switch", { name: "Notifications" });
  expect(toggle.tagName).toBe("INPUT");
  expect(toggle).toHaveAttribute("type", "checkbox");
});

test("clicking an associated label toggles the switch natively", async () => {
  const user = userEvent.setup();
  render(
    <label>
      <Switch />
      Enable notifications
    </label>,
  );

  const toggle = screen.getByRole("switch");
  expect(toggle).not.toBeChecked();

  await user.click(screen.getByText("Enable notifications"));
  expect(toggle).toBeChecked();
});

test("Space toggles a focused switch", async () => {
  const user = userEvent.setup();
  render(<Switch aria-label="Notifications" />);
  const toggle = screen.getByRole("switch");

  toggle.focus();
  await user.keyboard(" ");

  expect(toggle).toBeChecked();
});

test("uncontrolled Switch respects defaultChecked and toggles freely", async () => {
  const user = userEvent.setup();
  render(<Switch aria-label="Notifications" defaultChecked />);
  const toggle = screen.getByRole("switch");

  expect(toggle).toBeChecked();
  await user.click(toggle);
  expect(toggle).not.toBeChecked();
});

test("controlled Switch reports changes via onCheckedChange", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch aria-label="Notifications" checked={false} onCheckedChange={onCheckedChange} />);

  await user.click(screen.getByRole("switch"));

  expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
});

test("a disabled Switch can't be toggled", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch aria-label="Notifications" disabled onCheckedChange={onCheckedChange} />);

  const toggle = screen.getByRole("switch");
  expect(toggle).toBeDisabled();

  await user.click(toggle);
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test("Switch merges a custom className with its defaults", () => {
  render(<Switch aria-label="Notifications" className="custom-switch" />);
  expect(screen.getByRole("switch")).toHaveClass("custom-switch", "peer");
});

test("Switch forwards its ref to the underlying input", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(<Switch ref={inputRef} aria-label="Notifications" />);
  expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
});
