import { act, createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./Carousel";

expect.extend(toHaveNoViolations);

// jsdom implements neither layout nor IntersectionObserver/ResizeObserver/
// Element.scrollIntoView, all of which Carousel relies on to track and
// drive scroll position — stub them so it can mount and be interacted with.
let intersectionCallback: IntersectionObserverCallback | null = null;

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  intersectionCallback = null;
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function FullCarousel(props: { onSelect?: (index: number) => void }) {
  return (
    <Carousel onSelect={props.onSelect}>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

// jsdom reports 0 for scroll/client width by default, which reads as
// "nothing to scroll to" — fake a container with more content than fits.
function makeScrollable(container: HTMLElement) {
  Object.defineProperty(container, "scrollWidth", { value: 900, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 300, configurable: true });
  fireEvent.scroll(container);
}

test("Carousel renders with no accessibility violations", async () => {
  const { container } = render(<FullCarousel />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Carousel and CarouselItem expose the WAI-ARIA carousel roles", () => {
  const { container } = render(<FullCarousel />);
  expect(container.querySelector('[role="region"][aria-roledescription="carousel"]')).toBeInTheDocument();
  expect(
    container.querySelectorAll('[role="group"][aria-roledescription="slide"]'),
  ).toHaveLength(3);
});

test("CarouselPrevious starts disabled and CarouselNext is enabled once there's more to scroll to", () => {
  const { container } = render(<FullCarousel />);
  expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();

  const scroller = container.querySelector('[role="region"] > div') as HTMLElement;
  makeScrollable(scroller);

  expect(screen.getByRole("button", { name: "Next slide" })).toBeEnabled();
});

test("CarouselNext scrolls the next slide into view", () => {
  const { container } = render(<FullCarousel />);
  const scroller = container.querySelector('[role="region"] > div') as HTMLElement;
  makeScrollable(scroller);

  fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

  expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
});

test("CarouselDots renders one dot per slide and marks the current one", () => {
  render(<FullCarousel />);
  const dots = screen.getAllByRole("button", { name: /Go to slide/ });
  expect(dots).toHaveLength(3);
  expect(dots[0]).toHaveAttribute("aria-current", "true");
  expect(dots[1]).not.toHaveAttribute("aria-current");
});

test("selecting a slide via IntersectionObserver updates CarouselDots and calls onSelect", () => {
  const onSelect = vi.fn();
  const { container } = render(<FullCarousel onSelect={onSelect} />);
  const slides = container.querySelectorAll('[role="group"][aria-roledescription="slide"]');

  act(() => {
    intersectionCallback?.(
      [{ target: slides[1], intersectionRatio: 1 } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });

  expect(onSelect).toHaveBeenCalledExactlyOnceWith(1);
  const dots = screen.getAllByRole("button", { name: /Go to slide/ });
  expect(dots[1]).toHaveAttribute("aria-current", "true");
  expect(dots[0]).not.toHaveAttribute("aria-current");
});

test("onSelect is not called for the initial slide on mount", () => {
  const onSelect = vi.fn();
  render(<FullCarousel onSelect={onSelect} />);
  expect(onSelect).not.toHaveBeenCalled();
});

test("CarouselContent merges a custom className with its defaults", () => {
  const { container } = render(
    <Carousel>
      <CarouselContent className="custom-content">
        <CarouselItem>Slide 1</CarouselItem>
      </CarouselContent>
    </Carousel>,
  );
  expect(container.querySelector(".custom-content")).toHaveClass("flex");
});

test("CarouselContent forwards its ref to the underlying scroll container", () => {
  const contentRef = createRef<HTMLDivElement>();
  render(
    <Carousel>
      <CarouselContent ref={contentRef}>
        <CarouselItem>Slide 1</CarouselItem>
      </CarouselContent>
    </Carousel>,
  );
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("CarouselDots throws outside of a Carousel", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<CarouselDots />)).toThrow(
    "<CarouselDots /> must be rendered inside a <Carousel>.",
  );
  consoleError.mockRestore();
});
