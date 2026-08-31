import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — stubbed the same way as
// ContextMenu.test.tsx/DropdownMenu.test.tsx/Select.test.tsx, which explain
// the full reasoning.
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
  vi.useRealTimers();
});

function FullTooltip(props: { delayDuration?: number; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Tooltip delayDuration={props.delayDuration} side={props.side}>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent>Helpful hint</TooltipContent>
    </Tooltip>
  );
}

test("Tooltip renders with no accessibility violations once shown", async () => {
  render(<FullTooltip delayDuration={0} />);
  act(() => {
    fireEvent.focus(screen.getByText("Hover me"));
  });
  // Showing is deferred a frame past the triggering event (see Tooltip.tsx
  // for why), so this doesn't resolve synchronously.
  const tooltip = await screen.findByRole("tooltip");
  const results = await axe(tooltip);
  expect(results).toHaveNoViolations();
});

test("the trigger renders as a focusable span, not a button", () => {
  render(<FullTooltip />);
  const trigger = screen.getByText("Hover me");
  expect(trigger.tagName).toBe("SPAN");
  expect(trigger).toHaveAttribute("tabIndex", "0");
});

test("the trigger has aria-describedby pointing at the tooltip content", () => {
  render(<FullTooltip />);
  const trigger = screen.getByText("Hover me");
  const content = document.getElementById(trigger.getAttribute("aria-describedby") ?? "");
  expect(content).toHaveTextContent("Helpful hint");
});

test("focus shows the tooltip immediately, with no delay", () => {
  vi.useFakeTimers();
  render(<FullTooltip delayDuration={100_000} />);

  act(() => {
    fireEvent.focus(screen.getByText("Hover me"));
  });
  act(() => {
    // Flushes the requestAnimationFrame TooltipContent defers showPopover()
    // through — plain vi.advanceTimersByTime() doesn't touch pending rAF
    // callbacks even with fake timers active; this is Vitest's dedicated
    // helper for that. Not needing to also wait out the (deliberately huge,
    // to prove it's bypassed) hover delay is the point of this test.
    vi.advanceTimersToNextFrame();
  });

  expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful hint");
});

test("hover waits delayDuration before showing", () => {
  vi.useFakeTimers();
  render(<FullTooltip delayDuration={300} />);
  const trigger = screen.getByText("Hover me");

  act(() => {
    fireEvent.mouseEnter(trigger);
  });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(299);
  });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1); // crosses the 300ms delay, scheduling the rAF
  });
  act(() => {
    vi.advanceTimersToNextFrame(); // flushes it
  });
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
});

test("mouse leaving before the delay elapses cancels the pending show", () => {
  vi.useFakeTimers();
  render(<FullTooltip delayDuration={300} />);
  const trigger = screen.getByText("Hover me");

  act(() => {
    fireEvent.mouseEnter(trigger);
  });
  act(() => {
    fireEvent.mouseLeave(trigger);
    vi.advanceTimersByTime(320);
  });

  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("blur hides the tooltip", async () => {
  render(<FullTooltip delayDuration={0} />);
  const trigger = screen.getByText("Hover me");

  act(() => {
    fireEvent.focus(trigger);
  });
  await screen.findByRole("tooltip");

  act(() => {
    fireEvent.blur(trigger);
  });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("Escape dismisses an open tooltip", async () => {
  render(<FullTooltip delayDuration={0} />);
  act(() => {
    fireEvent.focus(screen.getByText("Hover me"));
  });
  await screen.findByRole("tooltip");

  act(() => {
    fireEvent.keyDown(document, { key: "Escape" });
  });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("scrolling the page dismisses an open tooltip", async () => {
  render(<FullTooltip delayDuration={0} />);
  act(() => {
    fireEvent.focus(screen.getByText("Hover me"));
  });
  await screen.findByRole("tooltip");

  act(() => {
    fireEvent.scroll(window);
  });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("does not lock background scroll while open, unlike Dialog/ContextMenu", async () => {
  render(<FullTooltip delayDuration={0} />);
  act(() => {
    fireEvent.focus(screen.getByText("Hover me"));
  });
  await screen.findByRole("tooltip");
  expect(document.body.style.overflow).not.toBe("hidden");
});

test("TooltipContent merges a custom className with its defaults", async () => {
  render(
    <Tooltip delayDuration={0}>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent className="custom-content">Hint</TooltipContent>
    </Tooltip>,
  );
  act(() => {
    fireEvent.focus(screen.getByText("Hover me"));
  });
  expect(await screen.findByRole("tooltip")).toHaveClass("custom-content", "fixed");
});

test("TooltipTrigger forwards its ref to the underlying span", () => {
  const triggerRef = createRef<HTMLSpanElement>();
  render(
    <Tooltip>
      <TooltipTrigger ref={triggerRef}>Hover me</TooltipTrigger>
      <TooltipContent>Hint</TooltipContent>
    </Tooltip>,
  );
  expect(triggerRef.current).toBeInstanceOf(HTMLSpanElement);
});

test("TooltipTrigger throws outside of a Tooltip", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<TooltipTrigger>Hover me</TooltipTrigger>)).toThrow(
    "<TooltipTrigger /> must be rendered inside a <Tooltip>.",
  );
  consoleError.mockRestore();
});
