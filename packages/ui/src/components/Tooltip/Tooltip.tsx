import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { mergeClassNames } from "../../utils/mergeClassNames";

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

export type TooltipSide = "top" | "right" | "bottom" | "left";

interface Position {
  x: number;
  y: number;
}

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean, position?: Position) => void;
  position: Position;
  delayDuration: number;
  side: TooltipSide;
  triggerRef: RefObject<HTMLSpanElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  contentId: string;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Tooltip>.`);
  }
  return context;
}

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds to wait before showing on hover. Focus shows immediately — see `DECISIONS.md`. Defaults to `300`. */
  delayDuration?: number;
  /** Which side of the trigger to show on. Defaults to `"top"`. */
  side?: TooltipSide;
  children?: ReactNode;
}

/**
 * A short, supplementary label shown near a trigger on hover or focus.
 * Compose it with `TooltipTrigger` and `TooltipContent`, per the WAI-ARIA
 * Tooltip pattern. Unlike `ContextMenu`/`DropdownMenu`/`Select`, this
 * isn't click-triggered, never receives focus itself, and doesn't lock
 * background scroll — a tooltip is a transient hint alongside whatever
 * you're already doing, not something you interact with in its own right.
 * See `DECISIONS.md` for how that shapes several choices below.
 */
export function Tooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 300,
  side = "top",
  children,
}: TooltipProps) {
  const contentId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (next: boolean, nextPosition?: Position) => {
      if (nextPosition) setPosition(nextPosition);
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <TooltipContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        position,
        delayDuration,
        side,
        triggerRef,
        contentRef,
        contentId,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Merge this trigger's hover/focus handlers and `aria-describedby` onto
   * its single child element instead of wrapping that child in a `<span>`.
   * For annotating something that must stay the sole focusable/interactive
   * node itself — a real `<a href>` or `<button>` — where the default
   * `<span tabIndex={0}>` wrapper would add a second, redundant tab stop
   * for what's really one control. The child is trusted to already be
   * focusable on its own; its existing `ref` and handlers are preserved
   * and merged with this trigger's, the same `cloneElement` composition
   * `AvatarGroup` uses to inject props into caller-supplied children.
   */
  asChild?: boolean;
}

/**
 * The element being annotated. Renders a plain `<span tabIndex={0}>`, not
 * a `<button>` — a tooltip's trigger is often something that isn't
 * actually actionable (a truncated label, a status icon), and claiming
 * button semantics for content with no click behavior would misdescribe
 * it. The `tabIndex` is what makes it focusable at all, satisfying the
 * WAI-ARIA requirement that a tooltip be reachable by keyboard, not mouse
 * hover alone. Pass `asChild` when the thing being annotated is already
 * its own real focusable element (see `asChild`'s own doc).
 */
export const TooltipTrigger = forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  (
    {
      asChild = false,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      tabIndex,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { onOpenChange, delayDuration, side, contentId, triggerRef } =
      useTooltipContext("TooltipTrigger");
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );

    const computePosition = useCallback((): Position => {
      const trigger = triggerRef.current;
      if (!trigger) return { x: 0, y: 0 };
      const rect = trigger.getBoundingClientRect();
      switch (side) {
        case "top":
          return { x: rect.left + rect.width / 2, y: rect.top };
        case "bottom":
          return { x: rect.left + rect.width / 2, y: rect.bottom };
        case "left":
          return { x: rect.left, y: rect.top + rect.height / 2 };
        case "right":
          return { x: rect.right, y: rect.top + rect.height / 2 };
      }
    }, [triggerRef, side]);

    // Focus shows immediately; hover waits `delayDuration` — a deliberate
    // difference, not an oversight. Focus is a discrete, deliberate action
    // a keyboard user took; a mouse passing over incidentally on its way
    // elsewhere is exactly what the hover delay exists to absorb.
    const show = useCallback(
      (immediate: boolean) => {
        clearTimeout(timerRef.current);
        if (immediate) {
          onOpenChange(true, computePosition());
        } else {
          timerRef.current = setTimeout(
            () => onOpenChange(true, computePosition()),
            delayDuration,
          );
        }
      },
      [onOpenChange, computePosition, delayDuration],
    );

    const hide = useCallback(() => {
      clearTimeout(timerRef.current);
      onOpenChange(false);
    }, [onOpenChange]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    if (asChild) {
      // `Children.only` enforces the one thing this branch requires: a
      // single real element to merge onto, not a text/fragment/multiple
      // children `cloneElement` couldn't attach a ref or handlers to.
      const child = Children.only(children) as ReactElement<
        Record<string, unknown>
      >;
      const childProps = child.props;
      const childOnMouseEnter = childProps.onMouseEnter as
        | ((event: React.SyntheticEvent) => void)
        | undefined;
      const childOnMouseLeave = childProps.onMouseLeave as
        | ((event: React.SyntheticEvent) => void)
        | undefined;
      const childOnFocus = childProps.onFocus as
        | ((event: React.SyntheticEvent) => void)
        | undefined;
      const childOnBlur = childProps.onBlur as
        | ((event: React.SyntheticEvent) => void)
        | undefined;
      const childRef = (childProps as { ref?: Ref<HTMLSpanElement> }).ref;
      // A callback ref, not `mergeRefs(triggerRef, ref, childRef)` — the
      // refs themselves are only ever touched *inside* it, which only
      // runs when React actually commits, never during render.
      const setRefs = (node: HTMLSpanElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as { current: HTMLSpanElement | null }).current = node;
        if (typeof childRef === "function") childRef(node);
        else if (childRef) (childRef as { current: HTMLSpanElement | null }).current = node;
      };
      // `cloneElement`'s prop types are keyed to the child's own props,
      // which this generic branch doesn't know ahead of time — `Record<string,
      // unknown>` here is the same accepted trade-off `AvatarGroup`'s own
      // `cloneElement` call makes injecting props it can't fully type
      // either, for a caller-supplied element this component can't see
      // the shape of statically.
      //
      // `react-hooks/refs` flags any props object handed to `cloneElement`
      // that contains a `ref` key at all, on the assumption it might read a
      // ref's `.current` during render — true of `mergeRefs(...)` called
      // inline, which is exactly why `setRefs` above deliberately isn't
      // that; it's a plain callback that only touches `.current` when
      // React invokes it at commit time, the same safe shape `ref={...}`
      // on a JSX element already has (a position this same rule does
      // recognize as safe two branches down, for the unmodified `<span>`).
      /* eslint-disable react-hooks/refs -- setRefs only reads/writes .current from inside the callback itself, never during this render */
      return cloneElement(
        child,
        {
          ...props,
          ref: setRefs,
          "aria-describedby": contentId,
          // `cloneElement` overwrites (not merges) any prop key it's given,
          // so `className` is combined with the child's own here — leaving
          // it out entirely, the way every other trigger prop below does by
          // simply not mentioning it, would instead have silently *kept
          // only* the child's original className whenever a caller also
          // passed one to `TooltipTrigger` itself.
          className: mergeClassNames(childProps.className as string | undefined, className),
          onMouseEnter: (event: React.SyntheticEvent) => {
            childOnMouseEnter?.(event);
            if (!event.defaultPrevented) show(false);
          },
          onMouseLeave: (event: React.SyntheticEvent) => {
            childOnMouseLeave?.(event);
            if (!event.defaultPrevented) hide();
          },
          onFocus: (event: React.SyntheticEvent) => {
            childOnFocus?.(event);
            if (!event.defaultPrevented) show(true);
          },
          onBlur: (event: React.SyntheticEvent) => {
            childOnBlur?.(event);
            if (!event.defaultPrevented) hide();
          },
        } as Record<string, unknown>,
      );
      /* eslint-enable react-hooks/refs */
    }

    return (
      <span
        ref={mergeRefs(triggerRef, ref)}
        tabIndex={tabIndex ?? 0}
        aria-describedby={contentId}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          if (!event.defaultPrevented) show(false);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          if (!event.defaultPrevented) hide();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (!event.defaultPrevented) show(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.defaultPrevented) hide();
        }}
        className={mergeClassNames(
          // No `display` utility of our own here (not even `inline-block`)
          // — this library's plain string-concat `mergeClassNames` has no
          // override resolution, so a `display` default here would compete
          // with, and could unpredictably beat, a caller's own `display`
          // utility (e.g. `flex` from `buttonVariants`) depending on
          // unrelated Tailwind generation order rather than className
          // string order. See DECISIONS.md's `Resizable` entry for the
          // same class of bug. A plain `<span>`'s own default `inline`
          // already suits the common truncated-label/status-icon case.
          "rounded-sm focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

const arrowPositionClassNames: Record<TooltipSide, string> = {
  top: "-bottom-1 left-1/2 -translate-x-1/2",
  bottom: "-top-1 left-1/2 -translate-x-1/2",
  left: "-right-1 top-1/2 -translate-y-1/2",
  right: "-left-1 top-1/2 -translate-y-1/2",
};

export type TooltipContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The tooltip bubble. A native popover (`popover="manual"`, not `"auto"`):
 * top-layer rendering (escaping a scrolling ancestor's `overflow:hidden`,
 * the way a tooltip inside a table cell or a card would otherwise get
 * clipped) still comes from the browser, but light-dismiss doesn't — a
 * tooltip closes on mouse-leave, blur, Escape, or a scroll, none of which
 * `popover="auto"`'s own outside-click/Escape handling is the right
 * mechanism for, so those are each handled explicitly here instead.
 *
 * Also portals into `document.body`, the second component in this library
 * to do that (after `Toast`) — and for a different reason than `Toast`'s.
 * `TooltipTrigger` is inline (`<span>`) specifically so a tooltip can
 * annotate a word inside running text, but `TooltipContent` is a `<div>`
 * (it needs to be, to hold a block-level bubble). Written directly where
 * `Tooltip`'s JSX places it, that `<div>` would land as a literal DOM
 * descendant of whatever's wrapping the trigger — a `<p>`, most commonly
 * for exactly the inline-annotation case — which is invalid HTML
 * (`<div>` isn't permitted inside `<p>`) regardless of the `<div>` being
 * visually promoted out of the page via `position: fixed` and the
 * popover top layer. The portal fixes this at the only place it can
 * actually be fixed: where the element really lives in the DOM, not just
 * where it's positioned on screen.
 */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, style, children, ...props }, ref) => {
    const { open, position, onOpenChange, contentRef, contentId, side } =
      useTooltipContext("TooltipContent");
    // `createPortal` needs `document`, unavailable during server rendering —
    // deferred to an effect the same way `Toaster` does, for the same reason.
    const [mounted, setMounted] = useState(false);
    // Same deliberate mount gate as `Toaster`, for the same hydration reason.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    // Deferred a frame past the triggering event before calling
    // `showPopover()`, the same as `ContextMenu` — verified directly (see
    // `DECISIONS.md`) that it's not strictly necessary for a hover/focus-
    // triggered open the way it is for `ContextMenu`'s `contextmenu`-
    // triggered one, but kept anyway for consistency with the one proven
    // pattern this library uses for every popover's opening sequence.
    useLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;

      if (!open) {
        if (el.matches(":popover-open")) el.hidePopover();
        return;
      }

      const frame = requestAnimationFrame(() => {
        if (!el.matches(":popover-open")) el.showPopover();
        const rect = el.getBoundingClientRect();
        const margin = 8;
        const gap = 8;
        let left: number;
        let top: number;
        switch (side) {
          case "top":
            left = position.x - rect.width / 2;
            top = position.y - rect.height - gap;
            break;
          case "bottom":
            left = position.x - rect.width / 2;
            top = position.y + gap;
            break;
          case "left":
            left = position.x - rect.width - gap;
            top = position.y - rect.height / 2;
            break;
          case "right":
            left = position.x + gap;
            top = position.y - rect.height / 2;
            break;
        }
        el.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - rect.width - margin))}px`;
        el.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - rect.height - margin))}px`;
      });
      return () => cancelAnimationFrame(frame);
    }, [open, position, contentRef, side]);

    // `popover="manual"` has no native Escape handling of its own (that's
    // `"auto"`-only), but the WAI-ARIA Tooltip pattern requires it, so it's
    // wired up by hand — a document-level listener rather than one on the
    // trigger, since a mouse-hovered (not focused) tooltip should still
    // dismiss on Escape even though focus is elsewhere on the page.
    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") onOpenChange(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    // Position is computed once, at show time, not tracked continuously —
    // so it won't follow the trigger if the page scrolls. Dismissing on
    // scroll avoids the tooltip drifting away from what it's annotating,
    // which would look far more broken than it simply disappearing.
    useEffect(() => {
      if (!open) return;
      const handleScroll = () => onOpenChange(false);
      window.addEventListener("scroll", handleScroll, {
        capture: true,
        passive: true,
      });
      return () =>
        window.removeEventListener("scroll", handleScroll, { capture: true });
    }, [open, onOpenChange]);

    if (!mounted) return null;

    return createPortal(
      <div
        ref={mergeRefs(contentRef, ref)}
        id={contentId}
        role="tooltip"
        popover="manual"
        style={{ top: position.y, left: position.x, ...style }}
        className={mergeClassNames(
          "fixed inset-auto m-0 max-w-xs rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs text-white shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:bg-white dark:text-slate-950",
          "scale-95 opacity-0 transition-[opacity,scale,overlay,display] transition-discrete duration-100 ease-out motion-reduce:transition-none [&:popover-open]:scale-100 [&:popover-open]:opacity-100 starting:[&:popover-open]:scale-95 starting:[&:popover-open]:opacity-0",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className={mergeClassNames(
            "absolute h-2 w-2 rotate-45 bg-slate-950 dark:bg-white",
            arrowPositionClassNames[side],
          )}
        />
      </div>,
      document.body,
    );
  },
);
TooltipContent.displayName = "TooltipContent";
