import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./Resizable";

expect.extend(toHaveNoViolations);

// jsdom has no layout engine, so getBoundingClientRect() always returns an
// all-zero rect — Resizable relies on measuring the group and its panels to
// convert a drag/keypress into a percentage, so stub fixed rects for a
// 400px-wide (or tall) group split evenly between two 200px panels. This
// mirrors Carousel's test file stubbing IntersectionObserver/ResizeObserver
// for the same reason: real layout-dependent browser behavior jsdom doesn't
// implement.
function mockRect(size: number): DOMRect {
  return {
    width: size,
    height: size,
    top: 0,
    left: 0,
    right: size,
    bottom: size,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  };
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const testId = this.getAttribute("data-testid");
    if (testId === "group") return mockRect(400);
    if (testId === "left" || testId === "right") {
      // Once a drag or keypress commits an explicit flexBasis, reflect it —
      // so a second interaction measures from the *result* of the first,
      // the same as a real browser would after actually laying it out.
      // Before that, `left` starts at its own 50% and `right` starts
      // unsized (flexBasis "0%", filled by flex-grow), which in a real
      // two-panel 400px group also renders at 200px — the fallback below.
      const basis = this.style.flexBasis;
      if (basis && basis !== "0%" && basis.endsWith("%")) {
        return mockRect((Number.parseFloat(basis) / 100) * 400);
      }
      return mockRect(200);
    }
    return mockRect(0);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function TwoPanels(props: { direction?: "horizontal" | "vertical"; leftMin?: number; leftMax?: number }) {
  return (
    <ResizablePanelGroup direction={props.direction} data-testid="group">
      <ResizablePanel defaultSize={50} minSize={props.leftMin} maxSize={props.leftMax} data-testid="left">
        Left
      </ResizablePanel>
      <ResizableHandle aria-label="Resize" />
      <ResizablePanel data-testid="right">Right</ResizablePanel>
    </ResizablePanelGroup>
  );
}

test("Resizable renders with no accessibility violations", async () => {
  const { container } = render(<TwoPanels />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("ResizablePanelGroup defaults to a horizontal (row) layout", () => {
  render(<TwoPanels />);
  expect(screen.getByTestId("group")).toHaveClass("flex-row");
});

test('direction="vertical" switches to a column layout and vertical orientation', () => {
  render(<TwoPanels direction="vertical" />);
  expect(screen.getByTestId("group")).toHaveClass("flex-col");
  expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
});

test("ResizableHandle is a focusable separator", () => {
  render(<TwoPanels />);
  const handle = screen.getByRole("separator", { name: "Resize" });
  expect(handle).toHaveAttribute("aria-orientation", "horizontal");
  expect(handle).toHaveAttribute("tabindex", "0");
});

test("withHandle renders a visual grip icon", () => {
  const { container, rerender } = render(
    <ResizablePanelGroup>
      <ResizablePanel defaultSize={50}>Left</ResizablePanel>
      <ResizableHandle aria-label="Resize" />
      <ResizablePanel>Right</ResizablePanel>
    </ResizablePanelGroup>,
  );
  expect(container.querySelector("svg")).not.toBeInTheDocument();

  rerender(
    <ResizablePanelGroup>
      <ResizablePanel defaultSize={50}>Left</ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize" />
      <ResizablePanel>Right</ResizablePanel>
    </ResizablePanelGroup>,
  );
  expect(container.querySelector("svg")).toBeInTheDocument();
});

test("dragging the handle resizes both neighboring panels", () => {
  render(<TwoPanels />);
  const handle = screen.getByRole("separator");

  fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 }); // +40px of 400px group = +10%
  fireEvent.pointerUp(handle, { pointerId: 1 });

  expect(screen.getByTestId("left")).toHaveStyle({ flexBasis: "60%" });
  expect(screen.getByTestId("right")).toHaveStyle({ flexBasis: "40%" });
  expect(handle).toHaveAttribute("aria-valuenow", "60");
});

test("dragging past a panel's minSize/maxSize clamps instead of overshooting", () => {
  render(<TwoPanels leftMin={30} />);
  const handle = screen.getByRole("separator");

  // Dragging the left edge far left would shrink `left` well past its 30% floor.
  fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientX: -300, pointerId: 1 });
  fireEvent.pointerUp(handle, { pointerId: 1 });

  expect(screen.getByTestId("left")).toHaveStyle({ flexBasis: "30%" });
  expect(screen.getByTestId("right")).toHaveStyle({ flexBasis: "70%" });
});

test("ArrowRight/ArrowLeft resize a horizontal handle by keyboard", () => {
  render(<TwoPanels />);
  const handle = screen.getByRole("separator");
  handle.focus();

  fireEvent.keyDown(handle, { key: "ArrowRight" });
  expect(screen.getByTestId("left")).toHaveStyle({ flexBasis: "52%" });

  fireEvent.keyDown(handle, { key: "ArrowLeft" });
  expect(screen.getByTestId("left")).toHaveStyle({ flexBasis: "50%" });
});

test("ArrowUp/ArrowDown resize a vertical handle by keyboard", () => {
  render(<TwoPanels direction="vertical" />);
  const handle = screen.getByRole("separator");
  handle.focus();

  fireEvent.keyDown(handle, { key: "ArrowDown" });
  expect(screen.getByTestId("left")).toHaveStyle({ flexBasis: "52%" });
});

test("Home/End jump to the resolved min/max for the left panel", () => {
  render(<TwoPanels leftMin={20} leftMax={80} />);
  const handle = screen.getByRole("separator");
  handle.focus();

  fireEvent.keyDown(handle, { key: "End" });
  expect(screen.getByTestId("left")).toHaveStyle({ flexBasis: "80%" });
});

test("ResizablePanelGroup merges a custom className with its defaults", () => {
  render(<ResizablePanelGroup className="custom-group" data-testid="group" />);
  expect(screen.getByTestId("group")).toHaveClass("custom-group", "flex");
});

test("ResizablePanelGroup forwards its ref", () => {
  const groupRef = createRef<HTMLDivElement>();
  render(<ResizablePanelGroup ref={groupRef} />);
  expect(groupRef.current).toBeInstanceOf(HTMLDivElement);
});

test("ResizablePanel forwards its ref", () => {
  const panelRef = createRef<HTMLDivElement>();
  render(
    <ResizablePanelGroup>
      <ResizablePanel ref={panelRef}>Left</ResizablePanel>
    </ResizablePanelGroup>,
  );
  expect(panelRef.current).toBeInstanceOf(HTMLDivElement);
});

test("ResizableHandle forwards its ref", () => {
  const handleRef = createRef<HTMLDivElement>();
  render(
    <ResizablePanelGroup>
      <ResizablePanel>Left</ResizablePanel>
      <ResizableHandle ref={handleRef} />
      <ResizablePanel>Right</ResizablePanel>
    </ResizablePanelGroup>,
  );
  expect(handleRef.current).toBeInstanceOf(HTMLDivElement);
});
