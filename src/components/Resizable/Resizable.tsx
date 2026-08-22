import {
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";
import { GripVertical } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
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

type Orientation = "horizontal" | "vertical";

const ResizableContext = createContext<Orientation>("horizontal");

export interface ResizablePanelGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `"horizontal"` (panels side by side, the default) or `"vertical"` (stacked). */
  direction?: Orientation;
}

/**
 * A row (or column) of panels that can be resized by dragging the handles
 * between them. Compose it with `ResizablePanel` and `ResizableHandle`,
 * alternating panel/handle/panel as direct children. A handle resizes only
 * its immediate previous and next sibling — reading and writing their sizes
 * straight off the DOM by adjacency, the same way `Carousel` reads its
 * slides from `containerRef.current.children` rather than a separate
 * id/registration system. See `DECISIONS.md` for what that scopes out.
 *
 * A `direction="vertical"` group needs an explicit height from its own
 * `className` (e.g. `h-80`, `h-screen`) — panels resolve their `defaultSize`
 * percentage against the group's main-axis size, and a flex container with
 * no definite height can't give them one to resolve against. `width` isn't
 * this component's problem the same way: it defaults to `w-full`, which is
 * virtually always what's wanted immediately for either orientation.
 */
export const ResizablePanelGroup = forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({ direction = "horizontal", className, ...props }, ref) => (
    <ResizableContext.Provider value={direction}>
      <div
        ref={ref}
        className={mergeClassNames(
          "flex w-full",
          direction === "vertical" ? "flex-col" : "flex-row",
          className,
        )}
        {...props}
      />
    </ResizableContext.Provider>
  ),
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Initial size, as a percentage of the group's main axis. Omit to fill the space left over by sized siblings, split evenly with any other unsized panels. */
  defaultSize?: number;
  /** Minimum size, as a percentage. Defaults to `0`. */
  minSize?: number;
  /** Maximum size, as a percentage. Defaults to `100`. */
  maxSize?: number;
}

/**
 * One panel in a `ResizablePanelGroup`. `minSize`/`maxSize` are read
 * straight back off this element's own `data-*` attributes by whichever
 * `ResizableHandle` is dragged next to it, rather than threaded through
 * context — a handle only ever needs to know about its two immediate
 * neighbors, never the whole group.
 */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ defaultSize, minSize = 0, maxSize = 100, style, className, ...props }, ref) => {
    const orientation = useContext(ResizableContext);
    return (
      <div
        ref={ref}
        data-min-size={minSize}
        data-max-size={maxSize}
        style={{
          flexGrow: defaultSize === undefined ? 1 : 0,
          flexShrink: defaultSize === undefined ? 1 : 0,
          flexBasis: defaultSize === undefined ? "0%" : `${defaultSize}%`,
          ...style,
        }}
        className={mergeClassNames("overflow-auto", orientation === "vertical" ? "min-h-0" : "min-w-0", className)}
        {...props}
      />
    );
  },
);
ResizablePanel.displayName = "ResizablePanel";

interface NeighborMeasurement {
  prev: HTMLElement;
  next: HTMLElement;
  startPrevSize: number;
  startNextSize: number;
  prevMin: number;
  prevMax: number;
  nextMin: number;
  nextMax: number;
}

interface DragState extends NeighborMeasurement {
  startPointer: number;
  groupSize: number;
}

const KEYBOARD_STEP = 2; // percent, per arrow-key press

export interface ResizableHandleProps extends HTMLAttributes<HTMLDivElement> {
  /** Shows a small grip icon centered on the handle. Defaults to `false`. */
  withHandle?: boolean;
}

/**
 * The draggable divider between two `ResizablePanel`s. Also a WAI-ARIA
 * window splitter (`role="separator"`, focusable, resizable with the arrow
 * keys and Home/End) — dragging is one input method for this, not the only
 * one.
 */
export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ withHandle = false, onPointerDown, onPointerMove, onPointerUp, onKeyDown, className, children, ...props }, ref) => {
    const orientation = useContext(ResizableContext);
    const handleRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);

    function measureNeighbors(): NeighborMeasurement | null {
      const handleEl = handleRef.current;
      const prev = handleEl?.previousElementSibling;
      const next = handleEl?.nextElementSibling;
      const group = handleEl?.parentElement;
      if (!(prev instanceof HTMLElement) || !(next instanceof HTMLElement) || !group) return null;

      const groupRect = group.getBoundingClientRect();
      const groupSize = orientation === "vertical" ? groupRect.height : groupRect.width;
      if (groupSize === 0) return null;
      const prevRect = prev.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();

      return {
        prev,
        next,
        startPrevSize: ((orientation === "vertical" ? prevRect.height : prevRect.width) / groupSize) * 100,
        startNextSize: ((orientation === "vertical" ? nextRect.height : nextRect.width) / groupSize) * 100,
        prevMin: Number(prev.dataset.minSize ?? 0),
        prevMax: Number(prev.dataset.maxSize ?? 100),
        nextMin: Number(next.dataset.minSize ?? 0),
        nextMax: Number(next.dataset.maxSize ?? 100),
      };
    }

    // Sizes are read fresh from the DOM and reapplied on every step, rather
    // than accumulated frame-to-frame, so drift from repeated rounding can't
    // build up over a long drag or a long run of keypresses.
    function applyDelta(measurement: NeighborMeasurement, deltaPercent: number) {
      const { prev, next, startPrevSize, startNextSize, prevMin, prevMax, nextMin, nextMax } = measurement;
      const total = startPrevSize + startNextSize;
      const lowerBound = Math.max(prevMin, total - nextMax);
      const upperBound = Math.min(prevMax, total - nextMin);
      const newPrevSize = Math.min(Math.max(startPrevSize + deltaPercent, lowerBound), upperBound);
      const newNextSize = total - newPrevSize;

      for (const [panel, size] of [
        [prev, newPrevSize],
        [next, newNextSize],
      ] as const) {
        panel.style.flexGrow = "0";
        panel.style.flexShrink = "0";
        panel.style.flexBasis = `${size}%`;
      }

      handleRef.current?.setAttribute("aria-valuenow", String(Math.round(newPrevSize)));
      handleRef.current?.setAttribute("aria-valuemin", String(Math.round(lowerBound)));
      handleRef.current?.setAttribute("aria-valuemax", String(Math.round(upperBound)));
    }

    // `aria-valuenow` is required the moment a `role="separator"` is
    // focusable (which this always is), not just once it's been dragged —
    // so measure and set it once at mount, applying a "delta" of 0 to reuse
    // the exact same clamping `applyDelta` already does rather than
    // re-deriving the bounds math a second time.
    useLayoutEffect(() => {
      const measurement = measureNeighbors();
      if (measurement) applyDelta(measurement, 0);
      // Only the initial value on mount is set this way — measureNeighbors
      // and applyDelta close over refs/props that are already current on
      // every call, so there's nothing else this effect needs to react to.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={mergeRefs(handleRef, ref)}
        role="separator"
        aria-orientation={orientation}
        tabIndex={0}
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerDown?.(event);
          if (event.defaultPrevented) return;
          const measurement = measureNeighbors();
          if (!measurement) return;
          const groupRect = handleRef.current?.parentElement?.getBoundingClientRect();
          const groupSize = groupRect ? (orientation === "vertical" ? groupRect.height : groupRect.width) : 0;
          if (groupSize === 0) return;
          dragRef.current = {
            ...measurement,
            groupSize,
            startPointer: orientation === "vertical" ? event.clientY : event.clientX,
          };
          // jsdom (used by this component's own unit tests) doesn't implement
          // pointer capture — guard the call rather than let it throw there.
          if (typeof event.currentTarget.setPointerCapture === "function") {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // Not supported in this environment; dragging still works via
              // the handle's own pointermove/pointerup listeners.
            }
          }
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerMove?.(event);
          if (event.defaultPrevented) return;
          const drag = dragRef.current;
          if (!drag) return;
          const pointer = orientation === "vertical" ? event.clientY : event.clientX;
          const deltaPercent = ((pointer - drag.startPointer) / drag.groupSize) * 100;
          applyDelta(drag, deltaPercent);
        }}
        onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerUp?.(event);
          dragRef.current = null;
          if (typeof event.currentTarget.releasePointerCapture === "function") {
            try {
              event.currentTarget.releasePointerCapture(event.pointerId);
            } catch {
              // See the setPointerCapture guard above.
            }
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const decreaseKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
          const increaseKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
          if (![decreaseKey, increaseKey, "Home", "End"].includes(event.key)) return;

          const measurement = measureNeighbors();
          if (!measurement) return;
          event.preventDefault();
          if (event.key === decreaseKey) applyDelta(measurement, -KEYBOARD_STEP);
          else if (event.key === increaseKey) applyDelta(measurement, KEYBOARD_STEP);
          else if (event.key === "Home") applyDelta(measurement, -measurement.startPrevSize);
          else applyDelta(measurement, measurement.startNextSize);
        }}
        className={mergeClassNames(
          "relative flex shrink-0 touch-none items-center justify-center bg-slate-200 transition-colors hover:bg-slate-300 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
          // `self-stretch`, not `h-full`/`w-full` (i.e. not a percentage):
          // the group's own height/width is itself intrinsic (sized to its
          // panels' content, not an explicit value), and a percentage
          // measured against an indefinite containing block collapses to
          // the item's content size instead of actually stretching — which
          // left the handle rendered at ~16px tall (just its grip icon)
          // instead of the full height of the panels beside it. `self-stretch`
          // stretches to the flex line's cross size directly, sidestepping
          // percentage resolution entirely.
          orientation === "vertical" ? "h-px self-stretch cursor-row-resize" : "w-px self-stretch cursor-col-resize",
          className,
        )}
        {...props}
      >
        {withHandle ? (
          <div
            className={mergeClassNames(
              "z-10 flex h-4 w-3 items-center justify-center rounded-xs border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400",
              orientation === "vertical" && "rotate-90",
            )}
          >
            <GripVertical className="h-2.5 w-2.5" aria-hidden="true" />
          </div>
        ) : null}
        {children}
      </div>
    );
  },
);
ResizableHandle.displayName = "ResizableHandle";
