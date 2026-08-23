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
import { Check, ChevronDown } from "lucide-react";

function mergeClassNames(
  ...classNames: Array<string | undefined | false>
): string {
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

interface Position {
  x: number;
  y: number;
  /** The trigger's width, applied as the content's `min-width` so the panel never renders narrower than the control it belongs to. */
  width: number;
}

interface SelectContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean, position?: Position) => void;
  position: Position;
  disabled?: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
  labels: Map<string, string>;
  registerLabel: (value: string, label: string) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(component: string): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Select>.`);
  }
  return context;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controls the open state. Omit to let the select manage its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A single-value select, built from a trigger button and a popup listbox
 * rather than a native `<select>` — unlike `Checkbox`/`RadioGroup`/`Input`,
 * a native `<select>`'s open dropdown can't be restyled in most browsers
 * (padding, hover color, radius on the `<option>` list itself are outside
 * CSS's reach), which is the one place this library's usual "style the
 * real native element" approach doesn't hold up. Compose it with
 * `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, and
 * `SelectSeparator`.
 *
 * Mechanically this draws on the same techniques `ContextMenu` proved out
 * (native popover, `requestAnimationFrame`-deferred opening, scroll lock,
 * roving keyboard focus via real DOM focus) rather than a new invention —
 * but it's a self-contained implementation, not built on `ContextMenu`
 * the way `DropdownMenu` is: a listbox's semantics (`role="listbox"`/
 * `"option"`, a persistent single selection) differ enough from a menu's
 * (`role="menu"`/`"menuitem"`, activate-and-close) that reusing
 * `ContextMenu`'s components directly would mean parameterizing their
 * roles and item selectors for a second, meaningfully different pattern —
 * more indirection than the reuse would actually save. See `DECISIONS.md`.
 */
export function Select({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  onOpenChange,
  disabled,
  children,
}: SelectProps) {
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, width: 0 });
  const [labels, setLabels] = useState<Map<string, string>>(new Map());

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isValueControlled = valueProp !== undefined;
  const value = isValueControlled ? valueProp : uncontrolledValue;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : uncontrolledOpen;

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  const handleOpenChange = useCallback(
    (next: boolean, nextPosition?: Position) => {
      if (nextPosition) setPosition(nextPosition);
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const registerLabel = useCallback((itemValue: string, label: string) => {
    setLabels((prev) =>
      prev.get(itemValue) === label
        ? prev
        : new Map(prev).set(itemValue, label),
    );
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        onOpenChange: handleOpenChange,
        position,
        disabled,
        contentRef,
        triggerRef,
        contentId,
        labels,
        registerLabel,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

export type SelectTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Opens the listbox when clicked (or with ArrowDown/ArrowUp while closed). Renders a native `<button role="combobox">`, per the WAI-ARIA Select pattern. */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className,
      onClick,
      onKeyDown,
      type = "button",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      disabled: groupDisabled,
      triggerRef,
      contentId,
    } = useSelectContext("SelectTrigger");
    const isDisabled = disabled ?? groupDisabled;

    const openListbox = useCallback(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      onOpenChange(true, {
        x: rect.left,
        y: rect.bottom + 4,
        width: rect.width,
      });
    }, [onOpenChange, triggerRef]);

    return (
      <button
        ref={mergeRefs(triggerRef, ref)}
        type={type}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={contentId}
        disabled={isDisabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (open) onOpenChange(false);
          else openListbox();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || open) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openListbox();
          }
        }}
        className={mergeClassNames(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px] dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:hover:border-slate-700",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          className={mergeClassNames(
            "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none dark:text-slate-400",
            open && "rotate-180",
          )}
        />
      </button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  /** Shown when nothing is selected yet. */
  placeholder?: string;
}

/** Displays the selected option's rendered text (derived from its `SelectItem`, not its `value`), or `placeholder` if nothing's selected. */
export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { value, labels } = useSelectContext("SelectValue");
    const label = value !== undefined ? labels.get(value) : undefined;
    return (
      <span
        ref={ref}
        className={mergeClassNames(
          "truncate",
          // Muted enough to read as a placeholder, dark enough to clear
          // AA against the trigger's white/slate-950 field — slate-400
          // here was 2.55:1 and failed `color-contrast`.
          !label && "text-slate-500 dark:text-slate-400",
          className,
        )}
        {...props}
      >
        {label ?? placeholder}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";

export type SelectContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The listbox panel, positioned below the trigger and matching its width.
 * A native popover (`popover="auto"`): Escape and outside clicks close it,
 * and it renders in the top layer, without any of that being reimplemented
 * here. `showPopover()` is deferred a frame past the triggering event for
 * the same reason documented on `ContextMenu` — calling it synchronously
 * races the browser's own handling of that event.
 */
export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, style, onKeyDown, ...props }, ref) => {
    const {
      open,
      position,
      onOpenChange,
      contentRef,
      triggerRef,
      contentId,
      value,
    } = useSelectContext("SelectContent");

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
        el.style.minWidth = `${position.width}px`;

        const options = el.querySelectorAll<HTMLElement>(
          '[role="option"]:not(:disabled)',
        );
        // Resume on the selected option, the same way a native <select>
        // opens focused where you left off, rather than always the first.
        const selected =
          value !== undefined
            ? el.querySelector<HTMLElement>(
                `[role="option"][data-value="${CSS.escape(value)}"]:not(:disabled)`,
              )
            : null;
        (selected ?? options[0])?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }, [open, position, contentRef, value]);

    // Prevent the page from scrolling behind the listbox while it's open,
    // the same treatment (and the same reasoning) as ContextMenu.
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
        role="listbox"
        onToggle={(event) => {
          if (event.newState !== "closed") return;
          onOpenChange(false);
          // Native <select> returns focus to itself after closing, whether
          // by choosing an option or dismissing without one — this covers
          // both, since a SelectItem click and Escape/an outside click all
          // funnel through this same native `toggle` event.
          triggerRef.current?.focus();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const options = Array.from(
            contentRef.current?.querySelectorAll<HTMLElement>(
              '[role="option"]:not(:disabled)',
            ) ?? [],
          );
          if (options.length === 0) return;
          const currentIndex = options.indexOf(
            document.activeElement as HTMLElement,
          );
          if (event.key === "ArrowDown") {
            event.preventDefault();
            options[
              (currentIndex + 1 + options.length) % options.length
            ]?.focus();
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            options[
              (currentIndex - 1 + options.length) % options.length
            ]?.focus();
          } else if (event.key === "Home") {
            event.preventDefault();
            options[0]?.focus();
          } else if (event.key === "End") {
            event.preventDefault();
            options[options.length - 1]?.focus();
          }
        }}
        style={{
          top: position.y,
          left: position.x,
          minWidth: position.width,
          ...style,
        }}
        className={mergeClassNames(
          // Same `inset-auto`/`m-0` reasoning as ContextMenuContent: clears
          // the popover UA stylesheet's centering so the explicit top/left
          // above aren't fought by an implicit right/bottom/margin:auto.
          "fixed inset-auto m-0 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:border-slate-800 dark:bg-slate-950 dark:text-white",
          "scale-95 opacity-0 transition-[opacity,scale,overlay,display] transition-discrete duration-150 ease-out motion-reduce:transition-none [&:popover-open]:scale-100 [&:popover-open]:opacity-100 starting:[&:popover-open]:scale-95 starting:[&:popover-open]:opacity-0",
          className,
        )}
        {...props}
      />
    );
  },
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

/**
 * One option. Renders a native `<button role="option">` — a real button
 * for click/Enter/Space activation, recategorized per the WAI-ARIA
 * Listbox pattern, the same interactive-element-plus-role-override
 * approach `ContextMenuItem`/`AccordionTrigger` use.
 */
export const SelectItem = forwardRef<HTMLButtonElement, SelectItemProps>(
  (
    {
      value: itemValue,
      className,
      children,
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const { value, onValueChange, onOpenChange, registerLabel } =
      useSelectContext("SelectItem");
    const labelRef = useRef<HTMLSpanElement>(null);
    const isSelected = value === itemValue;

    // Registers this item's rendered text as its label, for SelectValue to
    // display and (if `value` itself isn't human-readable) for the trigger
    // to show something meaningful. Runs every render rather than being
    // gated by a dependency array, since `children` can be arbitrary
    // JSX whose rendered text isn't itself a stable dependency to watch —
    // `registerLabel` already no-ops when the label hasn't actually
    // changed, so this doesn't cause extra re-renders in the common case.
    //
    // A *layout* effect, not a plain one: until this has run, `labels` is
    // empty and a `Select` with a `defaultValue` paints its placeholder
    // instead of the selected item's label. As a passive effect that
    // correction lands a frame late, which the Storybook a11y run catches
    // as a real failure — its `play` reads the trigger on that first
    // commit and sees "Select a fruit" where "Banana" belongs. This reads
    // the item's *own* ref, attached before its own layout effects run, so
    // it's safe here in a way `CommandInput`'s sibling-reading effect
    // isn't.
    useLayoutEffect(() => {
      registerLabel(itemValue, labelRef.current?.textContent ?? "");
    });

    return (
      <button
        ref={ref}
        type={type}
        role="option"
        data-value={itemValue}
        aria-selected={isSelected}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onValueChange(itemValue);
          onOpenChange(false);
        }}
        className={mergeClassNames(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
          "text-slate-950 hover:bg-slate-100 focus:bg-slate-100 dark:text-white dark:hover:bg-slate-800 dark:focus:bg-slate-800",
          className,
        )}
        {...props}
      >
        <span ref={labelRef} className="flex-1 truncate">
          {children}
        </span>
        {isSelected && (
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
      </button>
    );
  },
);
SelectItem.displayName = "SelectItem";

export type SelectSeparatorProps = HTMLAttributes<HTMLDivElement>;

/**
 * A visual divider between options. Unlike `ContextMenuSeparator`/
 * `PaginationEllipsis`, this renders with **no** ARIA role at all rather
 * than `role="separator"` — verified directly via axe that `role="listbox"`
 * doesn't permit a `separator` child the way `role="menu"` does (the ARIA
 * spec's required-owned-elements differ between the two patterns), so the
 * same treatment here would be invalid ARIA structure, not just a
 * stylistic difference from the menu components.
 */
export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames(
        "-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800",
        className,
      )}
      {...props}
    />
  ),
);
SelectSeparator.displayName = "SelectSeparator";
