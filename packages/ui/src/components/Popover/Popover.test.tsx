import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./Popover";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — stubbed the same way as
// ContextMenu.test.tsx/DropdownMenu.test.tsx/Select.test.tsx, which explain
// the full reasoning. Native light-dismiss (Escape, outside clicks) isn't
// covered here for the same reason it isn't in those files — see Popover's
// "Interactive" story for what real Chromium verifies instead.
const openPopovers = new WeakSet<Element>();
let originalMatches: typeof Element.prototype.matches;

beforeEach(() => {
  originalMatches = Element.prototype.matches;
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    openPopovers.add(this);
    this.style.display = "block";
    this.dispatchEvent(withNewState(new Event("toggle"), "open"));
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    openPopovers.delete(this);
    this.style.removeProperty("display");
    // Needs to actually dispatch the `toggle` event: PopoverContent's
    // return-focus-to-trigger behavior lives entirely in its `onToggle`
    // handler.
    this.dispatchEvent(withNewState(new Event("toggle"), "closed"));
  };
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return openPopovers.has(this);
    return originalMatches.call(this, selector);
  } as typeof originalMatches;
});

function withNewState(event: Event, newState: "open" | "closed"): Event {
  Object.defineProperty(event, "newState", { value: newState });
  return event;
}

afterEach(() => {
  Element.prototype.matches = originalMatches;
});

function FullPopover(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Popover onOpenChange={props.onOpenChange}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <p>Popover content</p>
        <a href="/settings">Settings</a>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

test("Popover renders with no accessibility violations once open", async () => {
  const user = userEvent.setup();
  const { container } = render(<FullPopover />);
  await user.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByRole("dialog");
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("PopoverTrigger has aria-haspopup and reflects aria-expanded", async () => {
  const user = userEvent.setup();
  render(<FullPopover />);
  const trigger = screen.getByRole("button", { name: "Open" });

  expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  await user.click(trigger);
  await screen.findByRole("dialog");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("clicking the trigger opens the panel closed initially, then toggles it shut on a second click", async () => {
  const user = userEvent.setup();
  render(<FullPopover />);
  const trigger = screen.getByRole("button", { name: "Open" });

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(trigger);
  expect(await screen.findByRole("dialog")).toBeInTheDocument();

  await user.click(trigger);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("opening focuses the first focusable element inside the content", async () => {
  const user = userEvent.setup();
  render(<FullPopover />);
  await user.click(screen.getByRole("button", { name: "Open" }));

  expect(await screen.findByRole("link", { name: "Settings" })).toHaveFocus();
});

test("with nothing focusable inside, opening focuses the content panel itself", async () => {
  const user = userEvent.setup();
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Just some text, nothing to focus.</PopoverContent>
    </Popover>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));

  expect(await screen.findByRole("dialog")).toHaveFocus();
});

test("PopoverClose closes the popover and returns focus to the trigger", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<FullPopover onOpenChange={onOpenChange} />);
  const trigger = screen.getByRole("button", { name: "Open" });

  await user.click(trigger);
  await user.click(await screen.findByRole("button", { name: "Close" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(trigger).toHaveFocus();
});

test("PopoverContent defaults its accessible name to the trigger's own id", async () => {
  const user = userEvent.setup();
  render(<FullPopover />);
  await user.click(screen.getByRole("button", { name: "Open" }));

  const dialog = await screen.findByRole("dialog");
  const trigger = screen.getByRole("button", { name: "Open" });
  expect(dialog).toHaveAttribute("aria-labelledby", trigger.id);
  expect(trigger.id).toBeTruthy();
});

test("an explicit aria-label on PopoverContent overrides the default aria-labelledby", async () => {
  const user = userEvent.setup();
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent aria-label="Profile card">Content</PopoverContent>
    </Popover>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));

  const dialog = await screen.findByRole("dialog", { name: "Profile card" });
  expect(dialog).not.toHaveAttribute("aria-labelledby");
});

test("PopoverContent forwards its ref to the underlying element", async () => {
  const contentRef = createRef<HTMLDivElement>();
  const user = userEvent.setup();
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent ref={contentRef}>Content</PopoverContent>
    </Popover>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByRole("dialog");
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("PopoverTrigger forwards its ref", () => {
  const triggerRef = createRef<HTMLButtonElement>();
  render(
    <Popover>
      <PopoverTrigger ref={triggerRef}>Open</PopoverTrigger>
    </Popover>,
  );
  expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
});

test("PopoverContent/PopoverTrigger/PopoverClose throw outside of a Popover", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<PopoverTrigger>Open</PopoverTrigger>)).toThrow(
    "<PopoverTrigger /> must be rendered inside a <Popover>.",
  );
  expect(() => render(<PopoverContent>Content</PopoverContent>)).toThrow(
    "<PopoverContent /> must be rendered inside a <Popover>.",
  );
  expect(() => render(<PopoverClose>Close</PopoverClose>)).toThrow(
    "<PopoverClose /> must be rendered inside a <Popover>.",
  );
  consoleError.mockRestore();
});
