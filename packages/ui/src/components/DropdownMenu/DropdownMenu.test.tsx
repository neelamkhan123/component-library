import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all (no showPopover/
// hidePopover, no `:popover-open`, and its CSS engine applies the real UA
// default of `[popover] { display: none }` regardless) — stubbed the same
// way as ContextMenu.test.tsx, which explains the full reasoning. Native
// light-dismiss (Escape, outside clicks) isn't covered here for the same
// reason it isn't in ContextMenu's jsdom tests — see the "Interactive"
// story's play function for what real Chromium can verify instead.
const openPopovers = new WeakSet<Element>();
let originalMatches: typeof Element.prototype.matches;

beforeEach(() => {
  originalMatches = Element.prototype.matches;
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    openPopovers.add(this);
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    openPopovers.delete(this);
    this.style.removeProperty("display");
  };
  // Cast through `typeof originalMatches` — `matches` is an overloaded
  // method, and a plain replacement function doesn't structurally satisfy
  // every overload on its own.
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return openPopovers.has(this);
    return originalMatches.call(this, selector);
  } as typeof originalMatches;
});

afterEach(() => {
  Element.prototype.matches = originalMatches;
});

function FullDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Share</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

test("DropdownMenu renders with no accessibility violations once open", async () => {
  const user = userEvent.setup();
  const { container } = render(<FullDropdownMenu />);
  await user.click(screen.getByRole("button", { name: "Options" }));
  await screen.findByRole("menu");
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("DropdownMenuTrigger has aria-haspopup and reflects aria-expanded", async () => {
  const user = userEvent.setup();
  render(<FullDropdownMenu />);
  const trigger = screen.getByRole("button", { name: "Options" });

  expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  await user.click(trigger);
  await screen.findByRole("menu");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("clicking the trigger opens the menu, focusing the first item", async () => {
  const user = userEvent.setup();
  render(<FullDropdownMenu />);

  await user.click(screen.getByRole("button", { name: "Options" }));

  expect(await screen.findByRole("menuitem", { name: "Rename" })).toHaveFocus();
});

test("clicking the trigger again while open closes the menu", async () => {
  const user = userEvent.setup();
  render(<FullDropdownMenu />);
  const trigger = screen.getByRole("button", { name: "Options" });

  await user.click(trigger);
  await screen.findByRole("menu");

  await user.click(trigger);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("activating an item closes the menu", async () => {
  const user = userEvent.setup();
  render(<FullDropdownMenu />);

  await user.click(screen.getByRole("button", { name: "Options" }));
  await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }));

  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("ArrowDown on the trigger opens the menu with the first item focused", async () => {
  render(<FullDropdownMenu />);
  const trigger = screen.getByRole("button", { name: "Options" });
  trigger.focus();

  fireEvent.keyDown(trigger, { key: "ArrowDown" });

  expect(await screen.findByRole("menuitem", { name: "Rename" })).toHaveFocus();
});

test("ArrowUp on the trigger opens the menu with the last enabled item focused", async () => {
  render(<FullDropdownMenu />);
  const trigger = screen.getByRole("button", { name: "Options" });
  trigger.focus();

  fireEvent.keyDown(trigger, { key: "ArrowUp" });

  // "Share" is disabled, so the last *focusable* item is "Duplicate".
  expect(await screen.findByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
});

test("ArrowDown/ArrowUp on the trigger do nothing once the menu is already open", async () => {
  const user = userEvent.setup();
  render(<FullDropdownMenu />);
  const trigger = screen.getByRole("button", { name: "Options" });

  await user.click(trigger);
  await screen.findByRole("menu");
  const renameItem = screen.getByRole("menuitem", { name: "Rename" });
  expect(renameItem).toHaveFocus();

  fireEvent.keyDown(trigger, { key: "ArrowDown" });

  // Focus doesn't move — that key is only meaningful on the *closed*
  // trigger; once inside the open menu, arrow-key roving focus is handled
  // by ContextMenuContent's own keydown listener instead.
  expect(renameItem).toHaveFocus();
});

test("DropdownMenuItem throws outside of a DropdownMenu", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<DropdownMenuItem>Rename</DropdownMenuItem>)).toThrow(
    "<ContextMenuItem /> must be rendered inside a <ContextMenu>.",
  );
  consoleError.mockRestore();
});

// jsdom has no layout engine, so `getBoundingClientRect()` reports all
// zeros here regardless of `side` — there's no real pixel position for
// these tests to check (that's what the "Interactive" story's play
// function, run against real Chromium, is for). What jsdom *can* prove is
// which CSS property the positioning effect chose to drive: `side="top"`
// must clear `top` and write `bottom` instead, since a leftover `top`
// from a previous open (or the library's own default) would fix the
// box's height and fight the `bottom` value below it.
test('side="top" anchors the menu with `bottom`, not `top`', async () => {
  const user = userEvent.setup();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger side="top">Account</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );

  await user.click(screen.getByRole("button", { name: "Account" }));
  const menu = await screen.findByRole("menu");

  expect(menu.style.top).toBe("auto");
  expect(menu.style.bottom).not.toBe("");
  expect(menu.style.bottom).not.toBe("auto");
});

test('side="top" still opens on ArrowUp/ArrowDown and focuses first/last, same as the default side', async () => {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger side="top">Account</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const trigger = screen.getByRole("button", { name: "Account" });
  trigger.focus();

  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  expect(await screen.findByRole("menuitem", { name: "Sign out" })).toHaveFocus();
});
