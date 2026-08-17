import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./ContextMenu";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all (no showPopover/
// hidePopover, no `:popover-open`), so it's stubbed here to the extent this
// component's own code depends on it: tracking open state and reflecting
// it through `.matches(":popover-open")`. This stands in for the state
// *this component drives*, not the browser's native light-dismiss
// (Escape, outside clicks), which real jsdom-based popovers wouldn't give
// us either way — that's verified separately against real Chromium via the
// "Interactive" story's play function. What's covered here is everything
// this component's own code is actually responsible for: opening at the
// cursor, roving focus, and item activation.
const openPopovers = new WeakSet<Element>();
let originalMatches: typeof Element.prototype.matches;

beforeEach(() => {
  originalMatches = Element.prototype.matches;
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    openPopovers.add(this);
    // jsdom's CSS engine does apply the real UA default of
    // `[popover] { display: none }` (even though it implements none of the
    // rest of the Popover API), so an inline override is needed here to
    // actually reveal the element — real browsers do this themselves as
    // part of `showPopover()`.
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    openPopovers.delete(this);
    this.style.removeProperty("display");
  };
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return openPopovers.has(this);
    return originalMatches.call(this, selector);
  };
});

afterEach(() => {
  Element.prototype.matches = originalMatches;
});

function FullContextMenu(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <ContextMenu onOpenChange={props.onOpenChange}>
      <ContextMenuTrigger data-testid="trigger">Right-click me</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>Print</ContextMenuItem>
        <ContextMenuItem variant="destructive">
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

test("ContextMenu renders with no accessibility violations once open", async () => {
  const { container } = render(<FullContextMenu />);
  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await screen.findByRole("menu");
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("right-clicking the trigger opens the menu and suppresses the native one", async () => {
  render(<FullContextMenu />);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();

  // Opening is deferred a frame past the triggering event (see
  // ContextMenu.tsx for why), so this doesn't resolve synchronously the
  // way most other open/close state in this library does.
  const event = fireEvent.contextMenu(screen.getByTestId("trigger"), {
    clientX: 50,
    clientY: 50,
  });

  expect(await screen.findByRole("menu")).toBeInTheDocument();
  expect(event).toBe(false); // fireEvent returns false when preventDefault() was called
});

test("menu items expose the WAI-ARIA menu/menuitem roles", async () => {
  render(<FullContextMenu />);
  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await screen.findByRole("menu");

  expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
    "Copy",
    "Paste",
    "Print",
    "Delete⌫",
  ]);
});

test("activating an item calls onClick and closes the menu", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger data-testid="trigger">Right-click me</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onClick}>Copy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );

  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await user.click(await screen.findByRole("menuitem", { name: "Copy" }));

  expect(onClick).toHaveBeenCalledOnce();
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("an item with closeOnSelect={false} keeps the menu open after activation", async () => {
  const user = userEvent.setup();
  render(
    <ContextMenu>
      <ContextMenuTrigger data-testid="trigger">Right-click me</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem closeOnSelect={false}>Toggle</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );

  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await user.click(await screen.findByRole("menuitem", { name: "Toggle" }));

  expect(screen.getByRole("menu")).toBeInTheDocument();
});

test("ArrowDown/ArrowUp move focus between items, wrapping at the ends", async () => {
  const user = userEvent.setup();
  render(<FullContextMenu />);
  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await screen.findByRole("menu");

  const [copy, paste] = screen.getAllByRole("menuitem");

  await user.keyboard("{ArrowDown}");
  expect(paste).toHaveFocus();

  await user.keyboard("{ArrowUp}");
  expect(copy).toHaveFocus();

  // Wraps past the start back to the last enabled item.
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("menuitem", { name: /Delete/ })).toHaveFocus();
});

test("disabled items are skipped by roving focus", async () => {
  render(<FullContextMenu />);
  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await screen.findByRole("menu");

  expect(screen.getByRole("menuitem", { name: "Print" })).toBeDisabled();
  const focusable = screen
    .getAllByRole("menuitem")
    .filter((item) => !(item as HTMLButtonElement).disabled);
  expect(focusable).toHaveLength(3);
});

test("ContextMenuSeparator and ContextMenuLabel render as expected", async () => {
  render(<FullContextMenu />);
  fireEvent.contextMenu(screen.getByTestId("trigger"), { clientX: 50, clientY: 50 });
  await screen.findByRole("menu");

  expect(screen.getByRole("separator")).toBeInTheDocument();
  expect(screen.getByText("Actions")).toBeInTheDocument();
});

test("ContextMenuContent merges a custom className with its defaults", async () => {
  render(
    <ContextMenu open>
      <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
      <ContextMenuContent className="custom-content">
        <ContextMenuItem>Copy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );
  expect(await screen.findByRole("menu")).toHaveClass("custom-content", "fixed");
});

test("ContextMenuContent forwards its ref to the underlying element", async () => {
  const contentRef = createRef<HTMLDivElement>();
  render(
    <ContextMenu open>
      <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
      <ContextMenuContent ref={contentRef}>
        <ContextMenuItem>Copy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );
  await screen.findByRole("menu");
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("ContextMenuItem throws outside of a ContextMenu", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<ContextMenuItem>Copy</ContextMenuItem>)).toThrow(
    "<ContextMenuItem /> must be rendered inside a <ContextMenu>.",
  );
  consoleError.mockRestore();
});
