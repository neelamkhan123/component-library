import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "./Select";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — stubbed the same way as
// ContextMenu.test.tsx and DropdownMenu.test.tsx, which explain the full
// reasoning. Native light-dismiss (Escape, outside clicks) isn't covered
// here for the same reason it isn't in those files — see Select's
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
    // Unlike ContextMenu/DropdownMenu's stubs, this one needs to actually
    // dispatch the `toggle` event: SelectContent's return-focus-to-trigger
    // behavior lives entirely in its `onToggle` handler, so without this
    // that behavior would look broken here even though it's genuinely
    // verified working against real Chromium in the "Interactive" story.
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

function FullSelect(props: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      defaultValue={props.defaultValue}
      value={props.value}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
    >
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectSeparator />
        <SelectItem value="blueberry" disabled>
          Blueberry (unavailable)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

test("Select renders with no accessibility violations once open", async () => {
  const user = userEvent.setup();
  const { container } = render(<FullSelect />);
  await user.click(screen.getByRole("combobox"));
  await screen.findByRole("listbox");
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("SelectValue shows a placeholder until something is selected", () => {
  render(<FullSelect />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Select a fruit");
});

test("SelectValue shows the selected item's rendered label, not its raw value", () => {
  render(<FullSelect defaultValue="apple" />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
});

test("SelectTrigger has aria-haspopup and reflects aria-expanded", async () => {
  const user = userEvent.setup();
  render(<FullSelect />);
  const trigger = screen.getByRole("combobox");

  expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  await user.click(trigger);
  await screen.findByRole("listbox");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("clicking the trigger opens the listbox, focusing the currently selected option", async () => {
  const user = userEvent.setup();
  render(<FullSelect defaultValue="banana" />);

  await user.click(screen.getByRole("combobox"));

  expect(await screen.findByRole("option", { name: "Banana" })).toHaveFocus();
});

test("with nothing selected, opening focuses the first option", async () => {
  const user = userEvent.setup();
  render(<FullSelect />);

  await user.click(screen.getByRole("combobox"));

  expect(await screen.findByRole("option", { name: "Apple" })).toHaveFocus();
});

test("selecting an option updates the value, closes the listbox, and returns focus to the trigger", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullSelect onValueChange={onValueChange} />);
  const trigger = screen.getByRole("combobox");

  await user.click(trigger);
  await user.click(await screen.findByRole("option", { name: "Banana" }));

  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("the selected option is marked with aria-selected and a checkmark", async () => {
  const user = userEvent.setup();
  render(<FullSelect defaultValue="apple" />);

  await user.click(screen.getByRole("combobox"));

  expect(await screen.findByRole("option", { name: "Apple" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "false");
});

test("ArrowDown/ArrowUp move focus between options, wrapping at the ends", async () => {
  const user = userEvent.setup();
  render(<FullSelect />);

  await user.click(screen.getByRole("combobox"));
  await screen.findByRole("listbox");

  const apple = screen.getByRole("option", { name: "Apple" });
  const banana = screen.getByRole("option", { name: "Banana" });

  await user.keyboard("{ArrowDown}");
  expect(banana).toHaveFocus();

  await user.keyboard("{ArrowUp}");
  expect(apple).toHaveFocus();

  // Wraps past the start; "Blueberry" is disabled and skipped.
  await user.keyboard("{ArrowUp}");
  expect(banana).toHaveFocus();
});

test("disabled options are skipped by roving focus and can't be selected", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullSelect onValueChange={onValueChange} />);

  await user.click(screen.getByRole("combobox"));
  const disabledOption = await screen.findByRole("option", { name: /Blueberry/ });
  expect(disabledOption).toBeDisabled();

  await user.click(disabledOption);
  expect(onValueChange).not.toHaveBeenCalled();
});

test("a disabled Select's trigger can't be opened", async () => {
  const user = userEvent.setup();
  render(<FullSelect disabled />);
  const trigger = screen.getByRole("combobox");

  expect(trigger).toBeDisabled();
  await user.click(trigger);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

test("controlled Select reflects an externally-set value", () => {
  render(<FullSelect value="banana" />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
});

test("SelectSeparator renders between items with no ARIA role", async () => {
  const user = userEvent.setup();
  const { container } = render(<FullSelect />);
  await user.click(screen.getByRole("combobox"));
  const listbox = await screen.findByRole("listbox");

  // Not queried by role: unlike ContextMenuSeparator, this intentionally
  // has none, since role="listbox" doesn't permit a role="separator" child.
  const separator = container.querySelector(".h-px");
  expect(separator).not.toBeNull();
  expect(separator).not.toHaveAttribute("role");
  expect(listbox).toContainElement(separator as HTMLElement);
});

test("SelectContent forwards its ref to the underlying element", async () => {
  const contentRef = createRef<HTMLDivElement>();
  const user = userEvent.setup();
  render(
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent ref={contentRef}>
        <SelectItem value="a">A</SelectItem>
      </SelectContent>
    </Select>,
  );
  await user.click(screen.getByRole("combobox"));
  await screen.findByRole("listbox");
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("SelectItem throws outside of a Select", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<SelectItem value="a">A</SelectItem>)).toThrow(
    "<SelectItem /> must be rendered inside a <Select>.",
  );
  consoleError.mockRestore();
});
