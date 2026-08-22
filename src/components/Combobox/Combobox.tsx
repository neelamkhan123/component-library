import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { Check, ChevronDown } from "lucide-react";

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

interface Position {
  x: number;
  y: number;
  width: number;
}

interface ComboboxContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  query: string;
  setQuery: (query: string) => void;
  /**
   * What `ComboboxItem`s actually filter against — deliberately distinct
   * from `query` (what's *displayed*). See `DECISIONS.md` for the bug this
   * separation fixes: opening a `Combobox` that already has a value used
   * to filter the list down by that value's own label before anyone had
   * typed anything, hiding every other option the instant you opened it.
   */
  filterText: string;
  setFilterText: (filterText: string) => void;
  activeValue: string | undefined;
  setActiveValue: (value: string | undefined) => void;
  open: boolean;
  onOpenChange: (open: boolean, position?: Position) => void;
  position: Position;
  disabled?: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  contentId: string;
  labels: Map<string, string>;
  registerLabel: (value: string, label: string) => void;
  hasVisibleItems: boolean;
  setHasVisibleItems: (hasVisibleItems: boolean) => void;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext(component: string): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Combobox>.`);
  }
  return context;
}

function optionId(contentId: string, value: string): string {
  return `${contentId}-option-${value}`;
}

export interface ComboboxProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A searchable, filterable `Select` — typing narrows `ComboboxItem`s down
 * to ones matching what's typed, rather than only ever picking from the
 * full list. Compose it with `ComboboxInput`, `ComboboxContent`,
 * `ComboboxItem`, and `ComboboxEmpty`.
 *
 * The one thing that couldn't just be reused wholesale from `Select`
 * (which this otherwise draws on for the same native-popover,
 * `requestAnimationFrame`-deferred-opening, viewport-clamped-positioning
 * plumbing): keyboard-highlighted options here use `aria-activedescendant`,
 * not real DOM focus the way `SelectItem`/`ContextMenuItem` do. That's not
 * an inconsistency — it's the one place in this library where moving real
 * focus is the wrong tool: focus has to stay on `ComboboxInput` itself
 * (that's what makes typing keep working while an option is highlighted),
 * so which option is "focused" can only be communicated virtually, via
 * ARIA, exactly the case `aria-activedescendant` exists for. See
 * `DECISIONS.md`.
 */
export function Combobox({ value: valueProp, defaultValue, onValueChange, disabled, children }: ComboboxProps) {
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, width: 0 });
  const [labels, setLabels] = useState<Map<string, string>>(new Map());
  const [query, setQuery] = useState("");
  const [filterText, setFilterText] = useState("");
  const [activeValue, setActiveValue] = useState<string | undefined>(undefined);
  const [hasVisibleItems, setHasVisibleItems] = useState(true);

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isValueControlled = valueProp !== undefined;
  const value = isValueControlled ? valueProp : uncontrolledValue;

  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  const handleOpenChange = useCallback((next: boolean, nextPosition?: Position) => {
    if (nextPosition) setPosition(nextPosition);
    setOpen(next);
  }, []);

  const registerLabel = useCallback((itemValue: string, label: string) => {
    setLabels((prev) => (prev.get(itemValue) === label ? prev : new Map(prev).set(itemValue, label)));
  }, []);

  return (
    <ComboboxContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        query,
        setQuery,
        filterText,
        setFilterText,
        activeValue,
        setActiveValue,
        open,
        onOpenChange: handleOpenChange,
        position,
        disabled,
        contentRef,
        inputRef,
        contentId,
        labels,
        registerLabel,
        hasVisibleItems,
        setHasVisibleItems,
      }}
    >
      {children}
    </ComboboxContext.Provider>
  );
}

export type ComboboxInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">;

/**
 * The editable trigger — a native `<input role="combobox">`, per the
 * WAI-ARIA Combobox pattern. Shows the selected option's label when closed;
 * while open, shows (and edits) the filter text instead, reverting back to
 * the selected label if closed without picking anything new.
 */
export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, onChange, onFocus, onClick, onMouseDown, onKeyDown, onBlur, disabled, ...props }, ref) => {
    const {
      value,
      query,
      setQuery,
      filterText,
      setFilterText,
      activeValue,
      setActiveValue,
      open,
      onOpenChange,
      disabled: groupDisabled,
      inputRef,
      contentRef,
      contentId,
      labels,
    } = useComboboxContext("ComboboxInput");
    const isDisabled = disabled ?? groupDisabled;
    const selectedLabel = value !== undefined ? (labels.get(value) ?? "") : "";

    // The displayed text is `query` only while genuinely interacting;
    // otherwise it mirrors the selected option, kept in sync here rather
    // than duplicated into a second piece of state.
    useEffect(() => {
      if (!open) setQuery(selectedLabel);
      // Only re-syncs when *closing* or when the selection itself changes —
      // not on every `open` toggle, so a query already being typed isn't
      // clobbered mid-edit.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, selectedLabel]);

    function visibleOptions(): HTMLElement[] {
      return Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not(:disabled)') ?? [],
      );
    }

    // Keeps `activeValue` pointed at a real visible option (defaulting to
    // the first one) whenever the filtered set changes — run as an effect,
    // after `ComboboxItem`s have actually re-rendered around the new
    // `filterText`, rather than read from the DOM synchronously in the
    // same event handler that changes it (which would only ever see last
    // render's, not-yet-updated, set of options).
    useLayoutEffect(() => {
      if (!open) return;
      const options = visibleOptions();
      if (!options.some((option) => option.dataset.value === activeValue)) {
        setActiveValue(options[0]?.dataset.value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, filterText]);

    function positionAndOpen() {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      onOpenChange(true, { x: rect.left, y: rect.bottom + 4, width: rect.width });
    }

    // The moment of opening with nothing freshly typed yet — resets
    // `filterText` so the full list shows, even if `query` itself still
    // displays a previously-selected value's label (see the `filterText`
    // doc comment on the context for the bug this avoids).
    function openShowingEverything() {
      setFilterText("");
      positionAndOpen();
    }

    // Memoized rather than a fresh closure every render: an inline
    // `mergeRefs(...)` call is a *new* function each time, and React treats
    // a changed `ref` prop identity as a reason to detach the old ref and
    // reattach the new one — which, for `ComboboxContent`'s equivalent ref
    // below, was observed to leave `contentRef.current` briefly `null`
    // during exactly the render this component's own effects (and a
    // sibling's) read it. Fixed here too, for the same reason, even though
    // this one wasn't caught actually breaking anything — see
    // `DECISIONS.md`.
    const setRefs = useMemo(() => mergeRefs(inputRef, ref), [inputRef, ref]);

    // Set on `mousedown`, read (and cleared) by `onFocus`/`onClick` below —
    // see the long comment on `onFocus` for why a mouse-originated focus
    // has to defer opening to the later `click` instead of opening
    // immediately the way a keyboard-originated one safely can.
    const pointerDownRef = useRef(false);

    return (
      <input
        ref={setRefs}
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={contentId}
        aria-activedescendant={activeValue ? optionId(contentId, activeValue) : undefined}
        autoComplete="off"
        disabled={isDisabled}
        value={query}
        onChange={(event) => {
          onChange?.(event);
          if (event.defaultPrevented) return;
          setQuery(event.target.value);
          setFilterText(event.target.value);
          if (!open) positionAndOpen();
        }}
        // A plain mousedown here — nothing needs preventing, just a note
        // that a real click *started*, read by `onFocus` right after.
        onMouseDown={(event) => {
          onMouseDown?.(event);
          pointerDownRef.current = true;
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (event.defaultPrevented) return;
          // A mouse click's `focus` fires on `mousedown` — well before
          // `mouseup` — so opening (and thus showing the popover) here
          // would show it *while the mouse button is still down*. The
          // native "auto" popover then dismisses itself the instant that
          // same button is released, even with this input established as
          // the popover's `source`/invoker (see the `showPopover` call
          // below): that exemption only covers a *fresh* interaction with
          // the invoker, not a release completing a gesture that was
          // already in progress before the popover existed. Deferring to
          // `onClick` — which fires strictly after `mouseup` — sidesteps
          // the race outright instead of fighting the browser's dismiss
          // timing. A keyboard-driven focus (Tab) has no such gesture in
          // flight, so it can still open immediately.
          if (pointerDownRef.current) return;
          if (!open) openShowingEverything();
        }}
        // Where a mouse-originated focus actually opens the popover (see
        // `onFocus`), and — since `mouseup`/`click` are the *only* events
        // fired when clicking a field that's already focused (e.g. right
        // after picking an option) — also what reopens it there, since no
        // `focus` event fires in that case for `onFocus` to react to.
        onClick={(event) => {
          onClick?.(event);
          pointerDownRef.current = false;
          if (!event.defaultPrevented && !open) openShowingEverything();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          // Defensive: a mousedown that drags off the input and releases
          // elsewhere never fires this input's own `click`, which is
          // otherwise what clears the flag `onFocus` set above.
          pointerDownRef.current = false;
          if (event.defaultPrevented) return;
          // Closing on blur (not just Escape/an outside click) matters
          // specifically for a text input: unlike a button trigger, it's
          // easy to tab or click straight into other page content without
          // ever dismissing the listbox otherwise.
          if (open) onOpenChange(false);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Escape") {
            if (open) {
              event.preventDefault();
              onOpenChange(false);
            }
            return;
          }
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openShowingEverything();
            return;
          }
          if (!open) return;
          const options = visibleOptions();
          if (options.length === 0) return;
          const currentIndex = options.findIndex((option) => option.dataset.value === activeValue);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveValue(options[(currentIndex + 1 + options.length) % options.length]?.dataset.value);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveValue(options[(currentIndex - 1 + options.length) % options.length]?.dataset.value);
          } else if (event.key === "Enter") {
            event.preventDefault();
            const active = options.find((option) => option.dataset.value === activeValue);
            active?.click();
          }
        }}
        className={mergeClassNames(
          "flex h-10 w-full items-center rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px] dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-600",
          className,
        )}
        {...props}
      />
    );
  },
);
ComboboxInput.displayName = "ComboboxInput";

export type ComboboxTriggerIconProps = HTMLAttributes<HTMLSpanElement>;

/** A purely decorative chevron, rotating when open — visual affordance only, the same role `ChevronDown` plays inside `SelectTrigger`. Place it absolutely inside a `relative` wrapper around `ComboboxInput`. */
export const ComboboxTriggerIcon = forwardRef<HTMLSpanElement, ComboboxTriggerIconProps>(
  ({ className, ...props }, ref) => {
    const { open } = useComboboxContext("ComboboxTriggerIcon");
    return (
      <span ref={ref} aria-hidden="true" className={mergeClassNames("pointer-events-none", className)} {...props}>
        <ChevronDown
          className={mergeClassNames(
            "h-4 w-4 text-slate-500 transition-transform duration-200 motion-reduce:transition-none dark:text-slate-400",
            open && "rotate-180",
          )}
        />
      </span>
    );
  },
);
ComboboxTriggerIcon.displayName = "ComboboxTriggerIcon";

export type ComboboxContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The filtered listbox, positioned below the input and matching its width.
 * A native popover (`popover="auto"`): Escape and outside clicks close it
 * without being reimplemented here. Unlike `SelectContent`, this has no
 * `onKeyDown` of its own — every key that matters is handled on
 * `ComboboxInput`, since focus never actually leaves it.
 */
export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, style, children, ...props }, ref) => {
    const { open, position, onOpenChange, contentRef, inputRef, contentId, filterText, setHasVisibleItems } =
      useComboboxContext("ComboboxContent");

    useLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;

      if (!open) {
        if (el.matches(":popover-open")) el.hidePopover();
        return;
      }

      const frame = requestAnimationFrame(() => {
        if (!el.matches(":popover-open")) {
          // Passing the input as this popover's `source` formally makes it
          // the popover's *invoker* — without that relationship, the
          // native "auto" popover's light-dismiss treats any interaction
          // with the input (even the very click that's opening it) as
          // "outside," and can close the popover the instant the same
          // click's `mouseup` lands, if `showPopover()` here — deliberately
          // deferred a frame for positioning — ends up landing mid-click
          // (a real click's mousedown-to-mouseup span is easily longer
          // than one frame). Declaring the invoker exempts the input from
          // that check entirely, matching what `popovertarget` gives a
          // `<button>` for free.
          el.showPopover({ source: inputRef.current ?? undefined });
        }
        const rect = el.getBoundingClientRect();
        const margin = 8;
        el.style.left = `${Math.max(margin, Math.min(position.x, window.innerWidth - rect.width - margin))}px`;
        el.style.top = `${Math.max(margin, Math.min(position.y, window.innerHeight - rect.height - margin))}px`;
        el.style.minWidth = `${position.width}px`;
      });
      return () => cancelAnimationFrame(frame);
    }, [open, position, contentRef]);

    // Recomputed after every render filterText could have changed — each
    // ComboboxItem decides for itself (synchronously, at render time)
    // whether it matches, so by the time this runs the DOM already
    // reflects the outcome; this just reports whether anything survived,
    // for ComboboxEmpty to act on.
    useLayoutEffect(() => {
      setHasVisibleItems((contentRef.current?.querySelectorAll('[role="option"]').length ?? 0) > 0);
    }, [filterText, contentRef, setHasVisibleItems]);

    useEffect(() => {
      if (!open) return;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [open]);

    // Memoized, not a fresh closure every render — see the identical note
    // on `ComboboxInput`'s own merged ref. This is the one that was
    // actually observed causing a bug: `ComboboxInput`'s roving-active-item
    // effect reads `contentRef.current` in the same commit, and an
    // unmemoized `mergeRefs(...)` here meant React detached and reattached
    // this ref on every single re-render — including the one right after
    // typing a character — leaving `contentRef.current` transiently `null`
    // exactly when that effect ran, so the newly active option was
    // computed against zero options and silently discarded every time.
    const setRefs = useMemo(() => mergeRefs(contentRef, ref), [contentRef, ref]);

    return (
      <div
        ref={setRefs}
        id={contentId}
        popover="auto"
        role="listbox"
        onToggle={(event) => {
          if (event.newState !== "closed") return;
          onOpenChange(false);
        }}
        style={{ top: position.y, left: position.x, minWidth: position.width, ...style }}
        className={mergeClassNames(
          "fixed inset-auto m-0 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:border-slate-800 dark:bg-slate-950 dark:text-white",
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
ComboboxContent.displayName = "ComboboxContent";

export interface ComboboxItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  value: string;
  /**
   * The visible label — a plain string, not arbitrary `children` the way
   * `SelectItem` allows. Filtering has to know an item's text *before*
   * deciding whether to render it at all, which only works against a
   * string known up front, not something derived from rendered JSX after
   * the fact. See `DECISIONS.md`.
   */
  children: string;
}

/** One filterable option. Renders `null` entirely (not just visually hidden) when `children` doesn't match the current filter text — case-insensitive substring matching. */
export const ComboboxItem = forwardRef<HTMLButtonElement, ComboboxItemProps>(
  ({ value: itemValue, className, children, onClick, onMouseDown, onMouseEnter, type = "button", ...props }, ref) => {
    const { value, filterText, activeValue, setActiveValue, onValueChange, onOpenChange, contentId, registerLabel } =
      useComboboxContext("ComboboxItem");
    const isSelected = value === itemValue;
    const isActive = activeValue === itemValue;

    useEffect(() => {
      registerLabel(itemValue, children);
    });

    const matches =
      filterText.trim() === "" || children.toLowerCase().includes(filterText.trim().toLowerCase());
    if (!matches) return null;

    return (
      <button
        ref={ref}
        id={optionId(contentId, itemValue)}
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
        // A mousedown here would otherwise focus this `<button>` and blur
        // `ComboboxInput` a beat before `onClick` runs — `ComboboxInput`'s
        // own `onBlur` treats that as "give up, close the listbox," which
        // fires *before* the click completes and silently swallows the
        // selection (the popover hides mid-click, so the click event
        // never even reaches this button). Preventing the default here is
        // what actually keeps real focus on `ComboboxInput`, the way
        // `DECISIONS.md` describes — not just an optimization.
        onMouseDown={(event) => {
          onMouseDown?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
        }}
        // Hovering an option makes it the active (highlighted) one too —
        // mouse and keyboard share one notion of "active" rather than
        // tracking them separately.
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          setActiveValue(itemValue);
        }}
        className={mergeClassNames(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white"
            : "text-slate-950 dark:text-white",
          className,
        )}
        {...props}
      >
        <span className="flex-1 truncate">{children}</span>
        {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
      </button>
    );
  },
);
ComboboxItem.displayName = "ComboboxItem";

export type ComboboxEmptyProps = HTMLAttributes<HTMLDivElement>;

/** Shown in place of the option list when nothing matches the current query. */
export const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ className, ...props }, ref) => {
    const { hasVisibleItems } = useComboboxContext("ComboboxEmpty");
    if (hasVisibleItems) return null;
    return (
      <div
        ref={ref}
        className={mergeClassNames("px-2 py-4 text-center text-sm text-slate-500 dark:text-slate-400", className)}
        {...props}
      />
    );
  },
);
ComboboxEmpty.displayName = "ComboboxEmpty";
