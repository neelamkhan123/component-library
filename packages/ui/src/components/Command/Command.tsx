import {
  createContext,
  forwardRef,
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
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from "../Dialog/Dialog";
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

interface CommandContextValue {
  query: string;
  setQuery: (query: string) => void;
  activeValue: string | undefined;
  setActiveValue: (value: string | undefined) => void;
  listRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  listId: string;
  hasVisibleItems: boolean;
  setHasVisibleItems: (hasVisibleItems: boolean) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommandContext(component: string): CommandContextValue {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Command>.`);
  }
  return context;
}

function optionId(listId: string, value: string): string {
  return `${listId}-option-${value}`;
}

export type CommandProps = HTMLAttributes<HTMLDivElement>;

/**
 * A searchable list of actions — a "command palette," in its embeddable
 * form rather than pre-wired to a modal (compose with `CommandDialog` for
 * the Cmd+K-triggered overlay most people picture; `Command` alone works
 * just as well planted directly in a page, e.g. a docs site's search).
 * Compose it with `CommandInput`, `CommandList`, `CommandGroup`,
 * `CommandItem`, and `CommandEmpty`.
 *
 * Filtering, `aria-activedescendant`-based keyboard highlighting, and the
 * "gate rendering on a plain string known up front" approach to
 * `CommandItem`'s `children` are all the exact techniques `Combobox`
 * already proved out — reused here rather than reinvented, since the
 * underlying interaction (type to narrow a list, arrow through it, Enter
 * to act on the highlighted one, real focus never leaving the input) is
 * the same problem with a different outcome (`Combobox` commits a value;
 * `CommandItem` runs an arbitrary `onSelect` action instead). See
 * `DECISIONS.md`.
 */
export const Command = forwardRef<HTMLDivElement, CommandProps>(({ className, children, ...props }, ref) => {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeValue, setActiveValue] = useState<string | undefined>(undefined);
  const [hasVisibleItems, setHasVisibleItems] = useState(true);

  return (
    <CommandContext.Provider
      value={{ query, setQuery, activeValue, setActiveValue, listRef, inputRef, listId, hasVisibleItems, setHasVisibleItems }}
    >
      <div
        ref={ref}
        className={mergeClassNames("flex flex-col overflow-hidden rounded-xl", className)}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
});
Command.displayName = "Command";

export type CommandInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">;

/**
 * The search box. A native `<input>` (not `role="combobox"` — there's no
 * persistent selected value here the way `ComboboxInput` has one, just a
 * live filter), keyboard-driving `CommandList` via `aria-activedescendant`
 * for the identical reason `ComboboxInput` does: focus has to stay on the
 * input itself for typing to keep working while an item is highlighted.
 */
export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onChange, onKeyDown, ...props }, ref) => {
    const { query, setQuery, activeValue, setActiveValue, listRef, inputRef, listId } =
      useCommandContext("CommandInput");

    function visibleItems(): HTMLElement[] {
      return Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not(:disabled)') ?? []);
    }

    // Keeps `activeValue` pointed at a real visible item (defaulting to the
    // first one) whenever the filtered set changes. A plain `useEffect`
    // here, deliberately not `useLayoutEffect`: this reads `CommandList`'s
    // ref from a sibling component, and React attaches refs and fires
    // `useLayoutEffect`s interleaved per fiber in tree order, not "every
    // ref across the whole tree, then every layout effect" — so
    // `CommandInput`, appearing first in the JSX, could run this layout
    // effect *before* `CommandList` (later in the tree) had attached its
    // own ref for that same commit, reading `null` every time regardless
    // of memoization. `useEffect` runs strictly after the *entire* tree's
    // layout phase completes, sidestepping that ordering question outright
    // rather than depending on component order in the JSX. Caught directly
    // by this component's own tests — see `DECISIONS.md`.
    useEffect(() => {
      const items = visibleItems();
      if (!items.some((item) => item.dataset.value === activeValue)) {
        setActiveValue(items[0]?.dataset.value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const setRefs = useMemo(() => mergeRefs(inputRef, ref), [inputRef, ref]);

    return (
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
        <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <input
          ref={setRefs}
          type="text"
          role="textbox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={activeValue ? optionId(listId, activeValue) : undefined}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            onChange?.(event);
            if (event.defaultPrevented) return;
            setQuery(event.target.value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const items = visibleItems();
            if (items.length === 0) return;
            const currentIndex = items.findIndex((item) => item.dataset.value === activeValue);
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveValue(items[(currentIndex + 1 + items.length) % items.length]?.dataset.value);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveValue(items[(currentIndex - 1 + items.length) % items.length]?.dataset.value);
            } else if (event.key === "Enter") {
              event.preventDefault();
              items.find((item) => item.dataset.value === activeValue)?.click();
            }
          }}
          className={mergeClassNames(
            "h-12 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CommandInput.displayName = "CommandInput";

export type CommandListProps = HTMLAttributes<HTMLDivElement>;

/**
 * The scrollable results region, holding `CommandGroup`s/`CommandItem`s and
 * (when nothing matches) `CommandEmpty`. Renders a native `<div
 * role="listbox">`. Defaults `aria-label` to `"Results"` — caught directly
 * by axe: a `listbox` has no "name from content" the way a `<button>` does,
 * so with nothing here it had no accessible name at all. Override it (or
 * pass `aria-labelledby`) for something more specific than the generic
 * default.
 */
export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, "aria-label": ariaLabel = "Results", ...props }, ref) => {
    const { listRef, listId, query, hasVisibleItems, setHasVisibleItems } = useCommandContext("CommandList");

    // Recomputed whenever `query` could have changed which CommandItems
    // rendered themselves at all — each decides for itself, synchronously,
    // whether it matches, so by the time this runs the DOM already
    // reflects the outcome; this just reports whether anything survived.
    // This one reads its *own* ref (attached before its *own* layout
    // effects run, always), so `useLayoutEffect` is fine here — unlike
    // `CommandInput`'s roving-active-item effect, which reads a sibling's.
    useLayoutEffect(() => {
      setHasVisibleItems((listRef.current?.querySelectorAll('[role="option"]').length ?? 0) > 0);
    }, [query, listRef, setHasVisibleItems]);

    const setRefs = useMemo(() => mergeRefs(listRef, ref), [listRef, ref]);

    return (
      <div
        ref={setRefs}
        id={listId}
        // Only a `listbox` while it actually holds options. When the query
        // matches nothing, the sole child is `CommandEmpty`'s message —
        // and a `listbox` whose children aren't `option`/`group` is an
        // `aria-required-children` violation (caught by the Storybook
        // a11y run, whose `play` leaves this story on a no-match query).
        // Dropping the role rather than the message is the honest fix: an
        // empty result list isn't a list of choices, and the input's
        // `aria-activedescendant` has nothing to point at either.
        role={hasVisibleItems ? "listbox" : undefined}
        aria-label={hasVisibleItems ? ariaLabel : undefined}
        className={mergeClassNames("max-h-80 overflow-y-auto p-2", className)}
        {...props}
      />
    );
  },
);
CommandList.displayName = "CommandList";

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading: string;
}

/** A labeled section of `CommandItem`s. Hides itself (heading included) when every item inside it has been filtered out, rather than leaving a heading floating over nothing. */
export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, className, children, ...props }, ref) => {
    const { query } = useCommandContext("CommandGroup");
    const headingId = useId();
    const groupRef = useRef<HTMLDivElement>(null);
    const [hasVisibleItems, setHasVisibleItems] = useState(true);

    useLayoutEffect(() => {
      setHasVisibleItems((groupRef.current?.querySelectorAll('[role="option"]').length ?? 0) > 0);
    }, [query]);

    const setRefs = useMemo(() => mergeRefs(groupRef, ref), [ref]);

    if (!hasVisibleItems) return null;

    return (
      <div
        ref={setRefs}
        role="group"
        aria-labelledby={headingId}
        className={mergeClassNames("flex flex-col gap-1 not-first:mt-2", className)}
        {...props}
      >
        <div id={headingId} className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {heading}
        </div>
        {children}
      </div>
    );
  },
);
CommandGroup.displayName = "CommandGroup";

export interface CommandItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onSelect"> {
  /** Identifies this item — matched against the query, and passed to `onSelect`. */
  value: string;
  /**
   * Called when this item is activated (clicked, or Enter while it's
   * highlighted). Named to match `value`'s own vocabulary, not the native
   * `onSelect` (a text-selection event every `HTMLAttributes` element
   * technically has) it shadows — `Omit`ted from the base props above so
   * this one, with its own unrelated signature, can take its place.
   */
  onSelect?: (value: string) => void;
  /**
   * The visible label — a plain string, not arbitrary `children`, the
   * same constraint `ComboboxItem` has and for the same reason: filtering
   * needs an item's text before deciding whether to render it at all.
   * Mixing an icon element in here (rather than using `icon` below) isn't
   * just a style choice this rules out — it's a real crash, caught
   * directly against this component's own first "as a command palette"
   * story: filtering short-circuits past `.toLowerCase()` while the query
   * is still empty, so it doesn't fail immediately, only the moment
   * someone actually types something.
   */
  children: string;
  /** An icon shown before the label — the place for one, since `children` can't hold anything but the label text. */
  icon?: ReactNode;
}

/** One action. Renders `null` entirely (not just visually hidden) when `children` doesn't match the current query — case-insensitive substring matching. */
export const CommandItem = forwardRef<HTMLButtonElement, CommandItemProps>(
  ({ value, onSelect, className, children, icon, onClick, onMouseEnter, type = "button", ...props }, ref) => {
    const { query, activeValue, setActiveValue, listId } = useCommandContext("CommandItem");
    const isActive = activeValue === value;

    const matches = query.trim() === "" || children.toLowerCase().includes(query.trim().toLowerCase());
    if (!matches) return null;

    return (
      <button
        ref={ref}
        id={optionId(listId, value)}
        type={type}
        role="option"
        data-value={value}
        aria-selected={isActive}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onSelect?.(value);
        }}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          setActiveValue(value);
        }}
        className={mergeClassNames(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
          isActive ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white" : "text-slate-950 dark:text-white",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span className="shrink-0 text-slate-500 [&>svg]:h-4 [&>svg]:w-4 dark:text-slate-400" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  },
);
CommandItem.displayName = "CommandItem";

export type CommandEmptyProps = HTMLAttributes<HTMLDivElement>;

/** Shown in place of the results when nothing matches the current query. */
export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(({ className, ...props }, ref) => {
  const { hasVisibleItems } = useCommandContext("CommandEmpty");
  if (hasVisibleItems) return null;
  return (
    <div
      ref={ref}
      className={mergeClassNames("px-2 py-6 text-center text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  );
});
CommandEmpty.displayName = "CommandEmpty";

export interface CommandDialogProps extends DialogProps {
  /**
   * The accessible name for the dialog — visually hidden, since a command
   * palette jumps straight to its search input rather than showing a
   * visible heading the way `Dialog` normally does. Defaults to `"Command
   * palette"`.
   */
  title?: ReactNode;
}

/**
 * `Command`, presented as the Cmd+K-style modal overlay most people picture
 * when they hear "command palette." A thin composition, not a new
 * implementation: `Dialog` for the modal mechanics (focus trapping,
 * Escape-to-close, top-layer stacking, all from the native `<dialog>`
 * `Dialog` already wraps), `Command` for everything about searching and
 * picking an item. `DialogTitle` is rendered `sr-only` rather than
 * omitted — `Dialog` requires one for an accessible name, and a command
 * palette still needs that name, just not displayed the way a normal
 * dialog's title is.
 *
 * No global Cmd+K listener is wired up here — deliberately. A `document`-level
 * keydown listener registered by a component that's mounted whenever this
 * one is in the tree (open or not) is a real, opinionated side effect that
 * would compete with whatever shortcut-handling an app already has; wiring
 * it is one `useEffect` in the caller's own code, shown directly in this
 * component's own story rather than assumed here. See `DECISIONS.md`.
 */
export function CommandDialog({ title = "Command palette", children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      {/*
        `p-0!` (Tailwind's important modifier), not a plain `p-0` — a bare
        `p-0` would be fighting `DialogContent`'s own default `p-6` for the
        exact same CSS property, and which of two same-specificity classes
        wins is decided by their order in the *generated* stylesheet, not
        by anything in this className string (the real bug `Resizable`
        and `Sidebar` both hit — see their own `DECISIONS.md` entries).
        `!important` sidesteps that ambiguity outright instead of hoping
        build order cooperates.
      */}
      <DialogContent className="max-w-lg p-0!" hideCloseButton>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}
