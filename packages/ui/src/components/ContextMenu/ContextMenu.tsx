import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
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

interface Position {
  x: number;
  y: number;
  /** Which item to focus once the menu opens at this position. Defaults to `"first"`. */
  initialFocus?: "first" | "last";
  /** Which edge `y` names. `"top"` (the default) is the cursor/click case
   *  and `DropdownMenuTrigger`'s normal "open below" — the menu's *top*
   *  sits at `y` and it grows downward, so its final height can be
   *  measured and clamped after the fact. `"bottom"` is
   *  `DropdownMenuTrigger`'s `side="top"` — the menu's *bottom* sits at
   *  `y` and it grows upward instead, which a top/height clamp can't
   *  express: at the moment `y` is chosen (the trigger's own rect, before
   *  the menu has rendered at all) there's no height yet to subtract from
   *  a top coordinate. Anchoring via the `bottom` CSS property sidesteps
   *  that — the browser grows the box upward on its own, no
   *  content-height lookahead required. */
  anchor?: "top" | "bottom";
}

interface ContextMenuContextValue {
  open: boolean;
  position: Position;
  onOpenChange: (open: boolean, position?: Position) => void;
  contentRef: RefObject<HTMLDivElement | null>;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(component: string): ContextMenuContextValue {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(
      `<${component} /> must be rendered inside a <ContextMenu>.`,
    );
  }
  return context;
}

/**
 * Reads the current open state and exposes a setter, for wiring up a
 * custom trigger — one that opens at a position other than the cursor —
 * that `ContextMenuTrigger` doesn't cover. `DropdownMenuTrigger` is built
 * on this.
 */
export function useContextMenu(): Pick<
  ContextMenuContextValue,
  "open" | "onOpenChange"
> {
  const { open, onOpenChange } = useContextMenuContext("useContextMenu()");
  return { open, onOpenChange };
}

export interface ContextMenuProps {
  /** Controls the open state. Omit to let the menu manage its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * A menu shown at the cursor on right-click, in place of the browser's own
 * context menu. Compose it with `ContextMenuTrigger`, `ContextMenuContent`,
 * `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuLabel`, and
 * `ContextMenuShortcut`. Built on the native Popover API (`popover="auto"`)
 * for `ContextMenuContent`, so top-layer stacking and light-dismiss
 * (Escape, clicking outside) come from the browser — the same reasoning
 * behind `Dialog` using the native `<dialog>` element. Submenus and
 * checkbox/radio items aren't included in this pass; see `DECISIONS.md`.
 */
export function ContextMenu({
  open: openProp,
  onOpenChange,
  children,
}: ContextMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
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
    <ContextMenuContext.Provider
      value={{ open, position, onOpenChange: handleOpenChange, contentRef }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
}

export type ContextMenuTriggerProps = HTMLAttributes<HTMLDivElement>;

/** The area that opens the menu on right-click. Renders a plain `<div>` around its children — suppresses the browser's own context menu in favor of this one. */
export const ContextMenuTrigger = forwardRef<
  HTMLDivElement,
  ContextMenuTriggerProps
>(({ onContextMenu, ...props }, ref) => {
  const { onOpenChange } = useContextMenuContext("ContextMenuTrigger");
  return (
    <div
      ref={ref}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onOpenChange(true, { x: event.clientX, y: event.clientY });
      }}
      {...props}
    />
  );
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";

export type ContextMenuContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The menu panel, positioned at the cursor. A native popover
 * (`popover="auto"`) rather than a hand-rolled floating `<div>`: Escape and
 * outside clicks close it, and it renders in the top layer, without any of
 * that being reimplemented here.
 */
export const ContextMenuContent = forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>(({ className, style, onKeyDown, ...props }, ref) => {
  const { open, position, onOpenChange, contentRef } =
    useContextMenuContext("ContextMenuContent");

  // Show/hide the popover as `open` (or, while already open, `position` —
  // right-clicking a new spot) changes.
  //
  // Opening is deferred a frame rather than called synchronously here.
  // Verified directly (see DECISIONS.md): calling `showPopover()` in the
  // same task as the triggering `contextmenu` event races the browser's
  // *own* internal handling of that gesture — it opens the popover only
  // for the browser to silently close it again ~100ms later, with
  // `:popover-open` never even matching in between. A microtask
  // (`queueMicrotask`) still lands inside that same task and hits the
  // identical failure; only deferring past the next paint
  // (`requestAnimationFrame`) actually works.
  //
  // Positioning and initial focus happen inside that same deferred
  // callback, after the popover is genuinely shown, so
  // `getBoundingClientRect()` reflects its real size instead of a
  // still-hidden zero rect.
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
      el.style.left = `${Math.max(margin, Math.min(position.x, window.innerWidth - rect.width - margin))}px`;
      if (position.anchor === "bottom") {
        // Growing upward from `y`: clear `top` (a stale value from a
        // previous top-anchored open would otherwise still apply, fixing
        // the box's height and fighting the `bottom` positioning below)
        // and clamp the distance from the viewport's bottom edge just
        // like the top-anchored branch clamps from its top — same
        // "don't run past the far edge" guard, mirrored.
        el.style.top = "auto";
        el.style.bottom = `${Math.max(margin, Math.min(window.innerHeight - position.y, window.innerHeight - rect.height - margin))}px`;
      } else {
        el.style.bottom = "auto";
        el.style.top = `${Math.max(margin, Math.min(position.y, window.innerHeight - rect.height - margin))}px`;
      }
      const items = el.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      );
      (position.initialFocus === "last"
        ? items[items.length - 1]
        : items[0]
      )?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, position, contentRef]);

  // Prevent the page from scrolling behind the menu while it's open, same
  // as `Dialog` does — a background that keeps scrolling under a
  // fixed-position menu is disorienting, and its position is pinned to
  // where the cursor was on open, not to whatever's now under it.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div
      ref={mergeRefs(contentRef, ref)}
      popover="auto"
      role="menu"
      // The native `close`/`toggle` event is the single source of truth for
      // closing, same as `Dialog` treats `<dialog>`'s `close` event — Escape
      // and outside clicks both resolve through here rather than a separate
      // handler per dismissal path.
      onToggle={(event) => {
        if (event.newState === "closed") onOpenChange(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const items = Array.from(
          contentRef.current?.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not(:disabled)',
          ) ?? [],
        );
        if (items.length === 0) return;
        const currentIndex = items.indexOf(
          document.activeElement as HTMLElement,
        );
        if (event.key === "ArrowDown") {
          event.preventDefault();
          items[(currentIndex + 1 + items.length) % items.length]?.focus();
        } else if (event.key === "ArrowUp") {
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
      style={{ top: position.y, left: position.x, ...style }}
      className={mergeClassNames(
        // `popover`'s UA stylesheet centers it via `inset: 0; margin: auto`
        // (the same trick `<dialog>` uses) — `inset-auto` clears that so the
        // explicit `top`/`left` above aren't fought by an implicit `right`/
        // `bottom: 0`, and `m-0` drops the auto-margin centering itself.
        "fixed inset-auto m-0 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:border-slate-800 dark:bg-slate-950 dark:text-white",
        // Popovers open/close state is exposed as the `:popover-open`
        // pseudo-class, not a reflected `[open]` attribute the way
        // `<dialog>`/`<details>` work — so unlike `Dialog`, this can't use
        // Tailwind's built-in `open:` variant and spells the selector out.
        "scale-95 opacity-0 transition-[opacity,scale,overlay,display] transition-discrete duration-150 ease-out motion-reduce:transition-none [&:popover-open]:scale-100 [&:popover-open]:opacity-100 starting:[&:popover-open]:scale-95 starting:[&:popover-open]:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
ContextMenuContent.displayName = "ContextMenuContent";

const contextMenuItemVariants = cva(
  // Highlight follows real DOM focus (`focus:`, not `focus-visible:`) rather
  // than only keyboard focus, unlike Button/Dialog's controls — a menu's
  // current item is itself the primary way of showing "you're here", the
  // same way OS context menus highlight the hovered/focused item
  // unconditionally, not just for keyboard users.
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-slate-950 hover:bg-slate-100 focus:bg-slate-100 dark:text-white dark:hover:bg-slate-800 dark:focus:bg-slate-800",
        destructive:
          "text-red-700 hover:bg-red-50 focus:bg-red-50 dark:text-red-300 dark:hover:bg-red-950 dark:focus:bg-red-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ContextMenuItemProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof contextMenuItemVariants> {
  /** Closes the menu after this item is activated. Defaults to `true`. */
  closeOnSelect?: boolean;
}

/** One action in the menu. Renders a native `<button role="menuitem">` — a real button for click/Enter/Space activation, recategorized into the composite `menu` widget per the WAI-ARIA Menu pattern. */
export const ContextMenuItem = forwardRef<
  HTMLButtonElement,
  ContextMenuItemProps
>(
  (
    {
      className,
      variant,
      onClick,
      type = "button",
      closeOnSelect = true,
      ...props
    },
    ref,
  ) => {
    const { onOpenChange } = useContextMenuContext("ContextMenuItem");
    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && closeOnSelect) onOpenChange(false);
        }}
        className={mergeClassNames(
          contextMenuItemVariants({ variant }),
          className,
        )}
        {...props}
      />
    );
  },
);
ContextMenuItem.displayName = "ContextMenuItem";

export type ContextMenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const ContextMenuSeparator = forwardRef<
  HTMLDivElement,
  ContextMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation="horizontal"
    className={mergeClassNames(
      "-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800",
      className,
    )}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export type ContextMenuLabelProps = HTMLAttributes<HTMLDivElement>;

/** A non-interactive heading for a group of items, e.g. "Actions". */
export const ContextMenuLabel = forwardRef<
  HTMLDivElement,
  ContextMenuLabelProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={mergeClassNames(
      "px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400",
      className,
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

export type ContextMenuShortcutProps = HTMLAttributes<HTMLSpanElement>;

/** A muted, right-aligned keyboard-shortcut hint — place it as the last child of a `ContextMenuItem`. */
export const ContextMenuShortcut = forwardRef<
  HTMLSpanElement,
  ContextMenuShortcutProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={mergeClassNames(
      "ml-auto pl-4 text-xs tracking-widest text-slate-400 dark:text-slate-500",
      className,
    )}
    {...props}
  />
));
ContextMenuShortcut.displayName = "ContextMenuShortcut";
