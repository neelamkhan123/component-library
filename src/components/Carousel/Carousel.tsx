import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type Ref,
  type RefObject,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

interface CarouselContextValue {
  containerRef: RefObject<HTMLDivElement | null>;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext(component: string): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Carousel>.`);
  }
  return context;
}

export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Called with the new index whenever the current slide changes — from the nav buttons, `CarouselDots`, a swipe, or a scroll. */
  onSelect?: (index: number) => void;
}

/**
 * A horizontally scrolling set of slides, one shown at a time. Compose it
 * with `CarouselContent`, `CarouselItem`, `CarouselPrevious`,
 * `CarouselNext`, and (optionally) `CarouselDots`. Built on native CSS
 * scroll-snap rather than a drag/transform library, so swipe, trackpad
 * scrolling, and momentum all come from the browser instead of being
 * reimplemented — the same reasoning behind `Dialog` using the native
 * `<dialog>` element.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, onSelect, onKeyDown, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndexState] = useState(0);
    const [slideCount, setSlideCount] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const setSelectedIndex = useCallback(
      (index: number) => {
        setSelectedIndexState(index);
        onSelect?.(index);
      },
      [onSelect],
    );

    const updateScrollButtons = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      setCanScrollPrev(el.scrollLeft > 1);
      setCanScrollNext(Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1);
    }, []);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      updateScrollButtons();
      el.addEventListener("scroll", updateScrollButtons, { passive: true });
      const resizeObserver = new ResizeObserver(updateScrollButtons);
      resizeObserver.observe(el);
      return () => {
        el.removeEventListener("scroll", updateScrollButtons);
        resizeObserver.disconnect();
      };
    }, [updateScrollButtons, slideCount]);

    const scrollTo = useCallback((index: number) => {
      const el = containerRef.current;
      const slide = el?.children[index];
      if (slide instanceof HTMLElement) {
        slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    }, []);

    const scrollPrev = useCallback(
      () => scrollTo(Math.max(selectedIndex - 1, 0)),
      [scrollTo, selectedIndex],
    );
    const scrollNext = useCallback(
      () => scrollTo(Math.min(selectedIndex + 1, slideCount - 1)),
      [scrollTo, selectedIndex, slideCount],
    );

    return (
      <CarouselContext.Provider
        value={{
          containerRef,
          selectedIndex,
          setSelectedIndex,
          slideCount,
          setSlideCount,
          canScrollPrev,
          canScrollNext,
          scrollPrev,
          scrollNext,
          scrollTo,
        }}
      >
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          // Arrow keys move the carousel once focus lands somewhere inside it
          // (a nav button, a dot, or focusable slide content) — the region
          // itself isn't given a tabIndex, so it doesn't add its own,
          // unlabeled stop to the tab order on top of those.
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollPrev();
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollNext();
            }
          }}
          className={mergeClassNames("relative", className)}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

export type CarouselContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The scrollable strip of `CarouselItem`s. Which slide counts as "current"
 * is tracked with an `IntersectionObserver` watching each item against this
 * element, rather than computed from `scrollLeft` and an assumed item
 * width, so it stays correct even if slides aren't all the same size.
 */
export const CarouselContent = forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...props }, ref) => {
    const { containerRef, setSelectedIndex, setSlideCount } =
      useCarouselContext("CarouselContent");

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const slides = Array.from(el.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      setSlideCount(slides.length);
      if (slides.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const mostVisible = entries.reduce<IntersectionObserverEntry | null>(
            (best, entry) =>
              !best || entry.intersectionRatio > best.intersectionRatio ? entry : best,
            null,
          );
          if (mostVisible && mostVisible.intersectionRatio > 0.5) {
            const index = slides.indexOf(mostVisible.target as HTMLElement);
            if (index !== -1) setSelectedIndex(index);
          }
        },
        { root: el, threshold: [0, 0.5, 1] },
      );
      slides.forEach((slide) => observer.observe(slide));
      return () => observer.disconnect();
    }, [children, containerRef, setSelectedIndex, setSlideCount]);

    return (
      <div
        ref={mergeRefs(containerRef, ref)}
        className={mergeClassNames(
          // The native scrollbar is hidden since CarouselPrevious/CarouselNext/
          // CarouselDots already give the same navigation affordance visually;
          // swipe, trackpad scrolling, and the arrow keys are unaffected —
          // only the browser's own scrollbar chrome is suppressed.
          "flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

export type CarouselItemProps = HTMLAttributes<HTMLDivElement>;

/** One slide. Sized to fill the carousel by default — override `className` (e.g. a fractional `basis-*`) to show more than one at a time. */
export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={mergeClassNames("w-full min-w-0 shrink-0 grow-0 basis-full snap-start", className)}
      {...props}
    />
  ),
);
CarouselItem.displayName = "CarouselItem";

const navButtonClassName =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,_rgba(0,0,0,0.08)_0px_0px_0px_1px] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950/90 dark:text-white dark:hover:bg-slate-950 dark:focus-visible:outline-white";

export type CarouselPreviousProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Scrolls to the previous slide. Disables itself at the start. Renders a native `<button>`, absolutely positioned over the carousel's left edge. */
export const CarouselPrevious = forwardRef<HTMLButtonElement, CarouselPreviousProps>(
  ({ className, onClick, type = "button", disabled, ...props }, ref) => {
    const { scrollPrev, canScrollPrev } = useCarouselContext("CarouselPrevious");
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled ?? !canScrollPrev}
        aria-label="Previous slide"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) scrollPrev();
        }}
        className={mergeClassNames(navButtonClassName, "left-3", className)}
        {...props}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

export type CarouselNextProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Scrolls to the next slide. Disables itself at the end. Renders a native `<button>`, absolutely positioned over the carousel's right edge. */
export const CarouselNext = forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, onClick, type = "button", disabled, ...props }, ref) => {
    const { scrollNext, canScrollNext } = useCarouselContext("CarouselNext");
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled ?? !canScrollNext}
        aria-label="Next slide"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) scrollNext();
        }}
        className={mergeClassNames(navButtonClassName, "right-3", className)}
        {...props}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export type CarouselDotsProps = HTMLAttributes<HTMLDivElement>;

/** A row of dots, one per slide, showing (and letting you jump to) the current one. */
export const CarouselDots = forwardRef<HTMLDivElement, CarouselDotsProps>(
  ({ className, ...props }, ref) => {
    const { slideCount, selectedIndex, scrollTo } = useCarouselContext("CarouselDots");
    return (
      <div
        ref={ref}
        className={mergeClassNames("flex items-center justify-center gap-2 pt-4", className)}
        {...props}
      >
        {Array.from({ length: slideCount }, (_, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={isSelected || undefined}
              onClick={() => scrollTo(index)}
              className={mergeClassNames(
                "h-1.5 w-1.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white",
                isSelected
                  ? "bg-slate-950 dark:bg-white"
                  : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600",
              )}
            />
          );
        })}
      </div>
    );
  },
);
CarouselDots.displayName = "CarouselDots";
