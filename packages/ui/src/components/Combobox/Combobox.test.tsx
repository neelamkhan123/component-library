import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from "./Combobox";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — stubbed the same way as
// ContextMenu.test.tsx/DropdownMenu.test.tsx/Select.test.tsx, which explain
// the full reasoning. Native light-dismiss (Escape, outside clicks) isn't
// covered here for the same reason it isn't in those files — see
// Combobox's "Interactive" story for what real Chromium verifies instead.
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

function FullCombobox(props: { defaultValue?: string; value?: string; onValueChange?: (value: string) => void }) {
  return (
    <Combobox defaultValue={props.defaultValue} value={props.value} onValueChange={props.onValueChange}>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent>
        <ComboboxItem value="apple">Apple</ComboboxItem>
        <ComboboxItem value="banana">Banana</ComboboxItem>
        <ComboboxItem value="blueberry">Blueberry</ComboboxItem>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

test("Combobox renders with no accessibility violations once open", async () => {
  const user = userEvent.setup();
  const { container } = render(<FullCombobox />);
  await user.click(screen.getByRole("combobox"));
  await screen.findByRole("listbox");
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("ComboboxInput has aria-haspopup and reflects aria-expanded", async () => {
  const user = userEvent.setup();
  render(<FullCombobox />);
  const input = screen.getByRole("combobox");

  expect(input).toHaveAttribute("aria-haspopup", "listbox");
  expect(input).toHaveAttribute("aria-expanded", "false");

  await user.click(input);
  await screen.findByRole("listbox");
  expect(input).toHaveAttribute("aria-expanded", "true");
});

test("focusing the input opens the listbox showing every option", async () => {
  const user = userEvent.setup();
  render(<FullCombobox />);
  await user.click(screen.getByRole("combobox"));

  expect(await screen.findAllByRole("option")).toHaveLength(3);
});

test("typing filters the visible options by a case-insensitive substring match", async () => {
  const user = userEvent.setup();
  render(<FullCombobox />);
  const input = screen.getByRole("combobox");

  await user.click(input);
  await user.type(input, "BLUE");

  const options = await screen.findAllByRole("option");
  expect(options).toHaveLength(1);
  expect(options[0]).toHaveTextContent("Blueberry");
});

test("typing re-activates the first surviving match, not whatever was active before", async () => {
  // A real bug, caught here: ComboboxContent's own merged ref was a fresh
  // closure every render, so React detached and reattached it on every
  // keystroke — leaving contentRef.current transiently null exactly when
  // this active-option effect ran, so it silently saw zero options and
  // never updated anything. Fixed by memoizing the merged ref; this test
  // is what actually caught it.
  const user = userEvent.setup();
  render(<FullCombobox />);
  const input = screen.getByRole("combobox");
  await user.click(input);

  await user.type(input, "blue");
  const blueberry = await screen.findByRole("option", { name: "Blueberry" });
  expect(input).toHaveAttribute("aria-activedescendant", blueberry.id);
});

test("ComboboxEmpty renders only when nothing matches the query", async () => {
  const user = userEvent.setup();
  render(<FullCombobox />);
  const input = screen.getByRole("combobox");

  await user.click(input);
  expect(screen.queryByText("No fruit found.")).not.toBeInTheDocument();

  await user.type(input, "xyz");
  expect(await screen.findByText("No fruit found.")).toBeInTheDocument();
});

test("selecting an option sets the value, closes the listbox, and shows the option's label", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullCombobox onValueChange={onValueChange} />);
  const input = screen.getByRole("combobox");

  await user.click(input);
  await user.click(await screen.findByRole("option", { name: "Banana" }));

  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(input).toHaveValue("Banana");
});

test("opening activates the first option by default, then ArrowDown/ArrowUp move it, wrapping", async () => {
  const user = userEvent.setup();
  render(<FullCombobox />);
  const input = screen.getByRole("combobox");
  await user.click(input);
  const apple = await screen.findByRole("option", { name: "Apple" });
  const banana = screen.getByRole("option", { name: "Banana" });
  const blueberry = screen.getByRole("option", { name: "Blueberry" });

  // Opening activates the first option on its own, the same way a native
  // <select> opens with something already highlighted.
  expect(input).toHaveAttribute("aria-activedescendant", apple.id);

  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", banana.id);

  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", blueberry.id);

  // Wraps past the end back to the start.
  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", apple.id);

  // Wraps past the start back to the end.
  await user.keyboard("{ArrowUp}");
  expect(input).toHaveAttribute("aria-activedescendant", blueberry.id);

  // Focus never actually leaves the input while an option is highlighted —
  // the whole reason this uses aria-activedescendant instead of real focus.
  expect(input).toHaveFocus();
});

test("Enter selects the active option", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullCombobox onValueChange={onValueChange} />);
  const input = screen.getByRole("combobox");

  await user.click(input);
  await user.keyboard("{ArrowDown}");
  await user.keyboard("{Enter}");

  // Apple was active by default on open; one ArrowDown moved to Banana.
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
  expect(input).toHaveValue("Banana");
});

test("closing without a selection reverts the input back to the current value's label", async () => {
  const user = userEvent.setup();
  render(<FullCombobox defaultValue="apple" />);
  const input = screen.getByRole("combobox");
  expect(input).toHaveValue("Apple");

  await user.click(input);
  await user.clear(input);
  await user.type(input, "xyz");
  expect(input).toHaveValue("xyz");

  await user.keyboard("{Escape}");
  expect(input).toHaveValue("Apple");
});

test("opening a Combobox that already has a value shows every option, not just ones matching that value's label", async () => {
  const user = userEvent.setup();
  render(<FullCombobox defaultValue="apple" />);
  const input = screen.getByRole("combobox");
  expect(input).toHaveValue("Apple");

  await user.click(input);

  // Before this was fixed, opening pre-filtered by the displayed "Apple"
  // text, hiding Banana and Blueberry the instant the listbox opened.
  expect(await screen.findAllByRole("option")).toHaveLength(3);
  expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
});

test("a controlled Combobox is driven entirely by its value prop", async () => {
  const user = userEvent.setup();
  render(<FullCombobox value="apple" onValueChange={() => {}} />);
  const input = screen.getByRole("combobox");
  expect(input).toHaveValue("Apple");

  await user.click(input);
  await user.click(await screen.findByRole("option", { name: "Banana" }));

  // Still "Apple" — a controlled Combobox's displayed value only changes
  // when the `value` prop itself does, the same as a controlled Select.
  expect(input).toHaveValue("Apple");
});

test("ComboboxItem requires a plain string label — verified it's used for both display and filtering", async () => {
  const user = userEvent.setup();
  render(
    <Combobox>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent>
        <ComboboxItem value="apple">Apple</ComboboxItem>
      </ComboboxContent>
    </Combobox>,
  );
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.type(input, "app");
  expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument();
});

test("ComboboxContent forwards its ref to the underlying element", async () => {
  const contentRef = createRef<HTMLDivElement>();
  const user = userEvent.setup();
  render(
    <Combobox>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent ref={contentRef}>
        <ComboboxItem value="a">A</ComboboxItem>
      </ComboboxContent>
    </Combobox>,
  );
  await user.click(screen.getByRole("combobox"));
  await screen.findByRole("listbox");
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("ComboboxInput forwards its ref", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(
    <Combobox>
      <ComboboxInput ref={inputRef} aria-label="Fruit" />
    </Combobox>,
  );
  expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
});

test("ComboboxItem throws outside of a Combobox", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<ComboboxItem value="a">A</ComboboxItem>)).toThrow(
    "<ComboboxItem /> must be rendered inside a <Combobox>.",
  );
  consoleError.mockRestore();
});
