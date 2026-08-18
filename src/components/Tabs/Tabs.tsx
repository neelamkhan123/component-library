import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type Ref,
} from "react";

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

interface TabsContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  orientation: Orientation;
  idPrefix: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Tabs>.`);
  }
  return context;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controls which tab is active. Omit to let the tabs manage their own state. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Defaults to `"horizontal"`. */
  orientation?: Orientation;
}

/**
 * A set of panels, one shown at a time, switched between via a strip of
 * tabs. Compose it with `TabsList`, `TabsTrigger`, and `TabsContent`, per
 * the WAI-ARIA Tabs pattern. Arrow keys move focus *and* selection
 * together between tabs — "automatic activation" in the pattern's terms —
 * unlike the roving focus in `ContextMenu`/`Select`, where arrow keys only
 * move focus and a separate click/Enter confirms a choice. That
 * distinction is deliberate: switching tabs by arrowing through a strip is
 * the expected behavior for tabs specifically (browser tab strips work the
 * same way), where a menu or listbox item might represent a destructive or
 * hard-to-undo action you shouldn't trigger just by moving through it.
 */
export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
  ...props
}: TabsProps) {
  const idPrefix = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolledValue;

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation, idPrefix }}>
      <div
        className={mergeClassNames(
          orientation === "vertical" ? "flex gap-4" : "flex flex-col gap-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

/**
 * The strip of `TabsTrigger`s. Renders `role="tablist"`. Arrow keys (Left/
 * Right, or Up/Down when `orientation="vertical"`) roam between tabs,
 * wrapping at the ends; Home/End jump to the first/last. Only the active
 * tab sits in the page's normal tab order (`tabIndex={0}`) — the rest are
 * `tabIndex={-1}` and reachable via the arrow keys instead, the standard
 * roving-tabindex shape for a widget where Tab should move *past* the
 * whole group, not through every item in it.
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, onKeyDown, ...props }, ref) => {
    const { onValueChange, orientation } = useTabsContext("TabsList");
    const listRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={mergeRefs(listRef, ref)}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;

          const tabs = Array.from(
            listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)') ?? [],
          );
          if (tabs.length === 0) return;
          const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);

          const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
          const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

          let nextIndex: number | null = null;
          if (event.key === nextKey) nextIndex = (currentIndex + 1 + tabs.length) % tabs.length;
          else if (event.key === previousKey) {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          } else if (event.key === "Home") nextIndex = 0;
          else if (event.key === "End") nextIndex = tabs.length - 1;

          if (nextIndex === null) return;
          event.preventDefault();
          const nextTab = tabs[nextIndex];
          nextTab.focus();
          const nextValue = nextTab.dataset.value;
          if (nextValue !== undefined) onValueChange(nextValue);
        }}
        className={mergeClassNames(
          "inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800",
          orientation === "vertical" && "flex-col items-stretch",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

/** One tab. Renders a native `<button role="tab">` — a real button for click/Enter/Space activation, recategorized per the WAI-ARIA Tabs pattern. */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value: triggerValue, className, onClick, type = "button", ...props }, ref) => {
    const { value, onValueChange, idPrefix } = useTabsContext("TabsTrigger");
    const isSelected = value === triggerValue;

    return (
      <button
        ref={ref}
        type={type}
        role="tab"
        id={`${idPrefix}-trigger-${triggerValue}`}
        aria-controls={`${idPrefix}-content-${triggerValue}`}
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        data-value={triggerValue}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onValueChange(triggerValue);
        }}
        className={mergeClassNames(
          "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-white",
          isSelected
            ? "bg-white text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] dark:bg-slate-950 dark:text-white"
            : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

/**
 * The panel for one tab. Renders `role="tabpanel"` with `tabIndex={0}`, so
 * keyboard users can move from the active tab straight into its panel
 * even when the panel's own content has nothing focusable in it. Only the
 * active panel is rendered at all — unlike `Accordion`, which keeps closed
 * content mounted to animate it, switching tabs isn't animated here, so
 * there's nothing gained by keeping inactive panels around. The trade-off
 * is real, not hidden: a panel's internal state (scroll position, an
 * uncontrolled input's value, …) is lost when you switch away and won't
 * be there if you switch back.
 */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value: contentValue, className, ...props }, ref) => {
    const { value, idPrefix } = useTabsContext("TabsContent");
    if (value !== contentValue) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${idPrefix}-content-${contentValue}`}
        aria-labelledby={`${idPrefix}-trigger-${contentValue}`}
        tabIndex={0}
        className={mergeClassNames(
          "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";
