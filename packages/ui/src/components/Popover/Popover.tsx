import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
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

// A reasonable, standard set — the same list focus-trap libraries reach
// for — since `PopoverContent` can hold literally anything (a form, a
// static profile card, a menu-like list of buttons), unlike `SelectContent`
// or `ContextMenuContent`, which only ever need to find their own fixed
// item role.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Position {
  x: number;
  y: number;
}

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean, position?: Position) => void;
  position: Position;
  contentRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
  triggerId: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Popover>.`);
  }
  return context;
}

export interface PopoverProps {
  /** Controls the open state. Omit to let the popover manage its own state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * A click-triggered panel of arbitrary rich content — a profile card, a
 * small form, anything that isn't a fixed list of options (`Select`) or
 * actions (`ContextMenu`/`DropdownMenu`) and isn't urgent enough to
 * interrupt the page the way `Dialog` does. Compose it with
 * `PopoverTrigger`, `PopoverContent`, and (optionally) `PopoverClose`.
 *
 * Mechanically this reuses `Select`'s own proven techniques almost exactly
 * (native popover, `requestAnimationFrame`-deferred opening, viewport-
 * clamped below-trigger positioning, the native `toggle` event as the
 * single source of truth for closing) rather than inventing new ones — the
 * two differ only in what's semantically true of a fixed listbox versus
 * arbitrary content, not in the underlying plumbing. See `DECISIONS.md`.
 */
export function Popover({ open: openProp, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const contentId = useId();
  const triggerId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
    <PopoverContext.Provider
      value={{ open, onOpenChange: handleOpenChange, position, contentRef, triggerRef, contentId, triggerId }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Opens/closes the popover when clicked. Renders a native `<button>` with `aria-haspopup="dialog"`, per the WAI-ARIA non-modal-dialog pattern a popover follows. */
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, onClick, type = "button", id, ...props }, ref) => {
    const { open, onOpenChange, triggerRef, contentId, triggerId } = usePopoverContext("PopoverTrigger");

    const openPopover = useCallback(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      onOpenChange(true, { x: rect.left, y: rect.bottom + 4 });
    }, [onOpenChange, triggerRef]);

    return (
      <button
        ref={mergeRefs(triggerRef, ref)}
        type={type}
        id={id ?? triggerId}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (open) onOpenChange(false);
          else openPopover();
        }}
        className={className}
        {...props}
      />
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

export type PopoverContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The popover panel — positioned below and left-aligned to the trigger,
 * clamped to stay on-screen near an edge, the same convention (and the
 * same deliberate cut of true flip-to-the-opposite-side placement)
 * `DropdownMenu` documents. A native popover (`popover="auto"`): Escape and
 * outside clicks close it, and it renders in the top layer, without either
 * being reimplemented here.
 *
 * `role="dialog"`, not `role="menu"`/`"listbox"` — its content isn't a
 * fixed set of activatable items, so there's no owned-element structure to
 * declare the way `ContextMenu`/`Select` do. Unlike `DialogContent`, no
 * title element is required: `Dialog` is modal and demands orientation from
 * whoever it just interrupted, but a popover is lighter-weight and usually
 * self-evident from whatever was clicked to open it. That "usually" is
 * carrying real weight, though — an ARIA `dialog` still needs *some*
 * accessible name (axe's `aria-dialog-name` rule catches its absence
 * directly), so lacking a required title element doesn't mean lacking a
 * name: this defaults `aria-labelledby` to `PopoverTrigger`'s own `id`,
 * reusing whatever already labels the trigger (an avatar's `aria-label`, a
 * button's text) as the popover's name too, for free. Pass `aria-label` or
 * `aria-labelledby` explicitly when the trigger's own label doesn't double
 * as a good name for what opens (an icon-only trigger labeled "Open", say).
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    { className, style, children, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props },
    ref,
  ) => {
    const { open, position, onOpenChange, contentRef, triggerRef, contentId, triggerId } =
      usePopoverContext("PopoverContent");

    // Deferred a frame past the triggering click, the same as `ContextMenu`/
    // `Select` — calling `showPopover()` synchronously races the browser's
    // own handling of the triggering event.
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
        el.style.top = `${Math.max(margin, Math.min(position.y, window.innerHeight - rect.height - margin))}px`;

        // Focus the first focusable thing inside — a form's first field, a
        // profile card's "Message" button — falling back to the panel
        // itself (`tabIndex={-1}` below makes that a valid focus target)
        // when there's nothing focusable at all, e.g. a purely informational
        // card. Mirrors `SelectContent` resuming focus inside itself on
        // open, generalized for content that isn't a fixed list of options.
        const focusable = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (focusable ?? el).focus();
      });
      return () => cancelAnimationFrame(frame);
    }, [open, position, contentRef]);

    // Prevent the page from scrolling behind the popover while it's open,
    // the same treatment (and the same reasoning) as ContextMenu/Select.
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
        id={contentId}
        popover="auto"
        role="dialog"
        tabIndex={-1}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? triggerId)}
        onToggle={(event) => {
          if (event.newState !== "closed") return;
          onOpenChange(false);
          // Native <select> (and this library's Select) returns focus to
          // its trigger after closing, whether from a choice or dismissal —
          // the same treatment here, for the same reason: whatever opened
          // this is where keyboard interaction should resume.
          triggerRef.current?.focus();
        }}
        style={{ top: position.y, left: position.x, ...style }}
        className={mergeClassNames(
          // Same `inset-auto`/`m-0` reasoning as ContextMenuContent/
          // SelectContent: clears the popover UA stylesheet's centering so
          // the explicit top/left above aren't fought by an implicit
          // right/bottom/margin:auto.
          "fixed inset-auto m-0 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-slate-200 bg-white p-4 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white",
          "scale-95 opacity-0 transition-[opacity,scale,overlay,display] transition-discrete duration-150 ease-out motion-reduce:transition-none [&:popover-open]:scale-100 [&:popover-open]:opacity-100 starting:[&:popover-open]:scale-95 starting:[&:popover-open]:opacity-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export type PopoverCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Closes the popover when clicked. Calls the native `hidePopover()` on
 * `PopoverContent` rather than updating state directly — funneling every
 * closure path (Escape, an outside click, this button) through the same
 * `toggle` event and its one `onOpenChange` call, the same reasoning
 * `DialogClose` calls the native `close()` method instead of setting state.
 */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ onClick, type = "button", ...props }, ref) => {
    const { contentRef } = usePopoverContext("PopoverClose");
    return (
      <button
        ref={ref}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          contentRef.current?.hidePopover();
        }}
        {...props}
      />
    );
  },
);
PopoverClose.displayName = "PopoverClose";
