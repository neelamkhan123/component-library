import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command";

expect.extend(toHaveNoViolations);

function FullCommand(props: { onSelect?: (value: string) => void }) {
  return (
    <Command>
      <CommandInput aria-label="Search" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar" onSelect={props.onSelect}>
            Calendar
          </CommandItem>
          <CommandItem value="search-emoji" onSelect={props.onSelect}>
            Search Emoji
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem value="profile" onSelect={props.onSelect}>
            Profile
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

test("Command renders with no accessibility violations", async () => {
  const { container } = render(<FullCommand />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders every item, grouped under its heading, with nothing typed", () => {
  render(<FullCommand />);
  expect(screen.getAllByRole("option")).toHaveLength(3);
  expect(screen.getByText("Suggestions")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
});

test("the first option is activated by default", () => {
  render(<FullCommand />);
  const input = screen.getByRole("textbox", { name: "Search" });
  const calendar = screen.getByRole("option", { name: "Calendar" });
  expect(input).toHaveAttribute("aria-activedescendant", calendar.id);
});

test("typing filters items by a case-insensitive substring match", async () => {
  const user = userEvent.setup();
  render(<FullCommand />);
  const input = screen.getByRole("textbox", { name: "Search" });

  await user.type(input, "EMOJI");

  const options = screen.getAllByRole("option");
  expect(options).toHaveLength(1);
  expect(options[0]).toHaveTextContent("Search Emoji");
});

test("a group with no surviving matches hides itself, heading included", async () => {
  const user = userEvent.setup();
  render(<FullCommand />);
  const input = screen.getByRole("textbox", { name: "Search" });

  await user.type(input, "emoji");

  await waitFor(() => expect(screen.queryByText("Settings")).not.toBeInTheDocument());
  expect(screen.getByText("Suggestions")).toBeInTheDocument();
});

test("CommandEmpty renders only when nothing matches", async () => {
  const user = userEvent.setup();
  render(<FullCommand />);
  const input = screen.getByRole("textbox", { name: "Search" });

  expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  await user.type(input, "xyz");
  expect(await screen.findByText("No results found.")).toBeInTheDocument();
});

test("ArrowDown/ArrowUp move the active option, wrapping, via aria-activedescendant", async () => {
  const user = userEvent.setup();
  render(<FullCommand />);
  const input = screen.getByRole("textbox", { name: "Search" });
  input.focus();
  const calendar = screen.getByRole("option", { name: "Calendar" });
  const emoji = screen.getByRole("option", { name: "Search Emoji" });
  const profile = screen.getByRole("option", { name: "Profile" });

  expect(input).toHaveAttribute("aria-activedescendant", calendar.id);

  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", emoji.id);

  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", profile.id);

  await user.keyboard("{ArrowDown}");
  expect(input).toHaveAttribute("aria-activedescendant", calendar.id);

  await user.keyboard("{ArrowUp}");
  expect(input).toHaveAttribute("aria-activedescendant", profile.id);

  // Real focus never leaves the input.
  expect(input).toHaveFocus();
});

test("Enter runs the active item's onSelect with its value", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<FullCommand onSelect={onSelect} />);
  const input = screen.getByRole("textbox", { name: "Search" });
  input.focus();

  await user.keyboard("{ArrowDown}");
  await user.keyboard("{Enter}");

  expect(onSelect).toHaveBeenCalledExactlyOnceWith("search-emoji");
});

test("clicking an item runs its onSelect", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<FullCommand onSelect={onSelect} />);

  await user.click(screen.getByRole("option", { name: "Profile" }));

  expect(onSelect).toHaveBeenCalledExactlyOnceWith("profile");
});

test("CommandItem requires a plain string label, used for both display and filtering", async () => {
  const user = userEvent.setup();
  render(
    <Command>
      <CommandInput aria-label="Search" />
      <CommandList>
        <CommandItem value="a">Alpha</CommandItem>
      </CommandList>
    </Command>,
  );
  const input = screen.getByRole("textbox", { name: "Search" });
  await user.type(input, "alp");
  expect(await screen.findByRole("option", { name: "Alpha" })).toBeInTheDocument();
});

test("the icon prop renders an icon without breaking filtering (a real crash this once caused)", async () => {
  // Caught directly against this component's first "as a command palette"
  // story: passing an icon element as part of `children` (instead of via
  // `icon`) type-checked fine at the call site (stories aren't
  // typechecked) but crashed the moment a query was typed, since filtering
  // calls `.toLowerCase()` on `children` — a function icon+text children
  // don't have. `icon` exists specifically so this can't happen.
  const user = userEvent.setup();
  render(
    <Command>
      <CommandInput aria-label="Search" />
      <CommandList>
        <CommandItem value="calendar" icon={<svg data-testid="calendar-icon" />}>
          Calendar
        </CommandItem>
      </CommandList>
    </Command>,
  );
  expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();

  const input = screen.getByRole("textbox", { name: "Search" });
  await user.type(input, "cal");
  expect(await screen.findByRole("option", { name: "Calendar" })).toBeInTheDocument();
});

test("CommandDialog renders role=dialog with a visually-hidden accessible name", async () => {
  render(
    <CommandDialog defaultOpen>
      <CommandInput aria-label="Search" />
      <CommandList>
        <CommandItem value="a">Alpha</CommandItem>
      </CommandList>
    </CommandDialog>,
  );
  const dialog = await screen.findByRole("dialog", { name: "Command palette" });
  expect(dialog.querySelector("h2")).toHaveClass("sr-only");
});

test("CommandDialog's title defaults can be overridden", async () => {
  render(
    <CommandDialog defaultOpen title="Jump to...">
      <CommandInput aria-label="Search" />
    </CommandDialog>,
  );
  expect(await screen.findByRole("dialog", { name: "Jump to..." })).toBeInTheDocument();
});

test("CommandDialog has no built-in corner close button", async () => {
  render(
    <CommandDialog defaultOpen>
      <CommandInput aria-label="Search" />
    </CommandDialog>,
  );
  await screen.findByRole("dialog");
  expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
});

test("Command merges a custom className with its defaults", () => {
  render(<Command className="custom-command" data-testid="cmd" />);
  expect(screen.getByTestId("cmd")).toHaveClass("custom-command", "rounded-xl");
});

test("Command forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<Command ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test("CommandInput forwards its ref", () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <Command>
      <CommandInput ref={ref} aria-label="Search" />
    </Command>,
  );
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});

test("CommandInput/CommandList/CommandGroup/CommandItem/CommandEmpty throw outside of a Command", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<CommandInput aria-label="Search" />)).toThrow(
    "<CommandInput /> must be rendered inside a <Command>.",
  );
  expect(() => render(<CommandItem value="a">A</CommandItem>)).toThrow(
    "<CommandItem /> must be rendered inside a <Command>.",
  );
  consoleError.mockRestore();
});
