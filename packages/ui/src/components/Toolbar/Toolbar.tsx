import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";
import { Tooltip, TooltipContent, TooltipTrigger, type TooltipSide } from "../Tooltip/Tooltip";

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

export type ToolbarSide = "left" | "right" | "top" | "bottom";

interface ToolbarContextValue {
  side: ToolbarSide;
}

const ToolbarContext = createContext<ToolbarContextValue>({ side: "left" });

// A tooltip should open away from the dock it's floating against, into the
// content area — the same "point outward" logic an icon-collapsed
// `SidebarMenuButton`'s tooltip follows relative to its own `Sidebar`.
const tooltipSideForToolbarSide: Record<ToolbarSide, TooltipSide> = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};

const dockClassNames: Record<ToolbarSide, string> = {
  left: "left-4 top-1/2 -translate-y-1/2 flex-col",
  right: "right-4 top-1/2 -translate-y-1/2 flex-col",
  top: "top-4 left-1/2 -translate-x-1/2 flex-row",
  bottom: "bottom-4 left-1/2 -translate-x-1/2 flex-row",
};

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which viewport edge to float against. `"left"`/`"right"` render a
   * vertical rail, `"top"`/`"bottom"` a horizontal one — orientation
   * follows directly from the edge rather than a separate setting, since a
   * combination like a horizontal bar hugging the left edge isn't a real
   * layout anyone wants. Defaults to `"left"`.
   */
  side?: ToolbarSide;
  /** Accessible name for the `role="toolbar"` landmark, e.g. `"Formatting"` or `"Quick actions"` — required, since a toolbar (unlike a `<button>`) has no name-from-content. */
  label: string;
}

/**
 * A floating, always-icon-only rail of actions docked to a viewport edge —
 * for a persistent quick-actions dock, the way an editor's formatting bar
 * or an app's activity rail behaves, as distinct from `Sidebar`: a
 * `Toolbar` never participates in page layout (it's `position: fixed`, not
 * a flex sibling `<main>` has to make room for) and is never anything but
 * icon-only — there's no open/collapsed state to toggle, unlike
 * `Sidebar`'s own `collapsible="icon"` mode which only *becomes* an icon
 * rail once closed.
 *
 * Implements the WAI-ARIA Toolbar pattern: `role="toolbar"` with roving
 * `tabIndex` (one item in the page's Tab sequence at a time; arrow keys —
 * matching `side`'s orientation, so a vertical rail responds to Up/Down and
 * a horizontal one to Left/Right — plus Home/End move between items). This
 * is a genuinely different interaction model from `Sidebar`'s own menu,
 * which is just links in normal Tab order, and the reason this is a
 * separate component rather than another `Sidebar` variant.
 *
 * The roving-tabIndex mechanism isn't special-cased to `ToolbarButton` — it
 * manages *any* enabled `<button>` descendant found by a plain DOM query
 * (the same "query the DOM directly" approach `ContextMenu`/`Calendar` use
 * for their own keyboard navigation), so dropping in a `Toggle` for a
 * pressable item (bold/italic-style, per `Toggle`'s own `DECISIONS.md`
 * entry) still participates for free. Grouping items is likewise just
 * composing the existing `Separator` — no `ToolbarSeparator` needed.
 *
 * No draggable repositioning, no auto-hide-on-scroll, and no configurable
 * edge offset in this pass — all genuinely separate features a caller can
 * layer on top, the same "no upload progress, no lightbox" scope-cut
 * spirit as `Attachment`.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ side = "left", label, onKeyDown, onFocus, className, children, ...props }, ref) => {
    const orientation = side === "left" || side === "right" ? "vertical" : "horizontal";
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const getItems = useCallback((): HTMLButtonElement[] => {
      return Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    }, []);

    // The one item that's currently `tabIndex={0}` (every other item is
    // `-1`) is tracked as plain state and applied here imperatively, not
    // via a `cloneElement`-injected prop per child — `Toolbar` doesn't
    // require its children to be exactly one recognized shape the way that
    // would, so a `Separator` or any other non-button content mixed in
    // between items is naturally skipped rather than needing to be
    // filtered out of a `Children.map` by hand.
    useLayoutEffect(() => {
      const items = getItems();
      const active = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1);
      items.forEach((item, index) => {
        item.tabIndex = index === active ? 0 : -1;
      });
    }, [activeIndex, children, getItems]);

    return (
      <ToolbarContext.Provider value={{ side }}>
        <div
          ref={mergeRefs(containerRef, ref)}
          role="toolbar"
          aria-label={label}
          aria-orientation={orientation}
          onFocus={(event) => {
            onFocus?.(event);
            const index = getItems().indexOf(event.target as unknown as HTMLButtonElement);
            if (index !== -1) setActiveIndex(index);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const items = getItems();
            if (items.length === 0) return;
            const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
            const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
            const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
            if (event.key === nextKey) {
              event.preventDefault();
              items[(currentIndex + 1 + items.length) % items.length]?.focus();
            } else if (event.key === prevKey) {
              event.preventDefault();
              items[(currentIndex - 1 + items.length) % items.length]?.focus();
            } else if (event.key === "Home") {
              event.preventDefault();
              items[0]?.focus();
            } else if (event.key === "End") {
              event.preventDefault();
              items[items.length - 1]?.focus();
            }
          }}
          className={mergeClassNames(
            "fixed z-50 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:border-slate-800 dark:bg-slate-950",
            dockClassNames[side],
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ToolbarContext.Provider>
    );
  },
);
Toolbar.displayName = "Toolbar";

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The button's icon — required, since a `Toolbar` item is icon-only by design (see `Toolbar`'s own doc). */
  icon: ReactNode;
  /** Both the button's accessible name and the text shown in its `Tooltip` on hover/focus. */
  label: string;
}

/**
 * One icon-only action in a `Toolbar`. The `Tooltip` showing `label` wraps
 * the real `<button>` itself via `TooltipTrigger`'s `asChild` rather than
 * an extra `<span tabIndex={0}>` around it — the same reasoning an
 * icon-collapsed `SidebarMenuButton` follows: this stays the one and only
 * focusable node for the control, not two redundant tab stops.
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ icon, label, type = "button", className, ...props }, ref) => {
    const { side } = useContext(ToolbarContext);
    return (
      <Tooltip side={tooltipSideForToolbarSide[side]}>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            type={type}
            aria-label={label}
            className={mergeClassNames(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
              className,
            )}
            {...props}
          >
            <span className="[&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
              {icon}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  },
);
ToolbarButton.displayName = "ToolbarButton";
