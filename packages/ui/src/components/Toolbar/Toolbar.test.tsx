import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test } from "vitest";
import { Bold, Italic, Underline } from "lucide-react";
import { Toolbar, ToolbarButton } from "./Toolbar";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — needed here because
// `ToolbarButton` renders a real `Tooltip`. Stubbed the same way as
// `Tooltip.test.tsx` itself (see there for the full reasoning).
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
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return openPopovers.has(this);
    return originalMatches.call(this, selector);
  } as typeof originalMatches;
});

afterEach(() => {
  Element.prototype.matches = originalMatches;
});

function FormattingToolbar(props: { side?: "left" | "right" | "top" | "bottom" }) {
  return (
    <Toolbar label="Formatting" side={props.side}>
      <ToolbarButton icon={<Bold />} label="Bold" />
      <ToolbarButton icon={<Italic />} label="Italic" />
      <ToolbarButton icon={<Underline />} label="Underline" />
    </Toolbar>
  );
}

test("Toolbar renders with no accessibility violations", async () => {
  const { container } = render(<FormattingToolbar />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('Toolbar renders role="toolbar" with the given accessible name', () => {
  render(<FormattingToolbar />);
  expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();
});

test.each([
  ["left", "vertical"],
  ["right", "vertical"],
  ["top", "horizontal"],
  ["bottom", "horizontal"],
] as const)('side="%s" sets aria-orientation="%s"', (side, orientation) => {
  render(<FormattingToolbar side={side} />);
  expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", orientation);
});

test("only the first item starts in the page's Tab sequence", () => {
  render(<FormattingToolbar />);
  expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("tabindex", "0");
  expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("tabindex", "-1");
  expect(screen.getByRole("button", { name: "Underline" })).toHaveAttribute("tabindex", "-1");
});

test("ArrowRight/ArrowLeft move focus and roving tabIndex in a horizontal toolbar", async () => {
  const user = userEvent.setup();
  render(<FormattingToolbar side="top" />);
  const bold = screen.getByRole("button", { name: "Bold" });
  const italic = screen.getByRole("button", { name: "Italic" });
  const underline = screen.getByRole("button", { name: "Underline" });

  bold.focus();
  await user.keyboard("{ArrowRight}");
  expect(italic).toHaveFocus();
  expect(italic).toHaveAttribute("tabindex", "0");
  expect(bold).toHaveAttribute("tabindex", "-1");

  // Wraps around past the last item.
  await user.keyboard("{ArrowRight}");
  await user.keyboard("{ArrowRight}");
  expect(bold).toHaveFocus();

  await user.keyboard("{ArrowLeft}");
  expect(underline).toHaveFocus();
});

test("ArrowDown/ArrowUp (not Left/Right) move focus in a vertical toolbar", async () => {
  const user = userEvent.setup();
  render(<FormattingToolbar side="left" />);
  const bold = screen.getByRole("button", { name: "Bold" });
  const italic = screen.getByRole("button", { name: "Italic" });

  bold.focus();
  await user.keyboard("{ArrowRight}");
  expect(bold).toHaveFocus();

  await user.keyboard("{ArrowDown}");
  expect(italic).toHaveFocus();
});

test("Home/End jump to the first/last item", async () => {
  const user = userEvent.setup();
  render(<FormattingToolbar side="top" />);
  const bold = screen.getByRole("button", { name: "Bold" });
  const underline = screen.getByRole("button", { name: "Underline" });

  bold.focus();
  await user.keyboard("{End}");
  expect(underline).toHaveFocus();
  await user.keyboard("{Home}");
  expect(bold).toHaveFocus();
});

test("a disabled item is skipped by arrow-key navigation", async () => {
  const user = userEvent.setup();
  render(
    <Toolbar label="Formatting" side="top">
      <ToolbarButton icon={<Bold />} label="Bold" />
      <ToolbarButton icon={<Italic />} label="Italic" disabled />
      <ToolbarButton icon={<Underline />} label="Underline" />
    </Toolbar>,
  );
  screen.getByRole("button", { name: "Bold" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("button", { name: "Underline" })).toHaveFocus();
});

test("ToolbarButton's Tooltip shows its label on focus and doesn't add a second tab stop", async () => {
  render(<FormattingToolbar />);
  const bold = screen.getByRole("button", { name: "Bold" });
  expect(bold.tagName).toBe("BUTTON");
  bold.focus();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Bold");
});

test("Toolbar merges a custom className with its defaults and forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Toolbar ref={ref} label="Formatting" className="custom-toolbar">
      <ToolbarButton icon={<Bold />} label="Bold" />
    </Toolbar>,
  );
  expect(screen.getByRole("toolbar")).toHaveClass("custom-toolbar", "fixed");
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test("ToolbarButton forwards its ref to the underlying button", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Toolbar label="Formatting">
      <ToolbarButton ref={ref} icon={<Bold />} label="Bold" />
    </Toolbar>,
  );
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
