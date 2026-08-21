import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

function normalizeValue(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside an <Accordion>.`);
  }
  return context;
}

interface AccordionItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext(component: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside an <AccordionItem>.`);
  }
  return context;
}

export interface AccordionSingleProps {
  /** At most one item open at a time. This is the default. */
  type?: "single";
  /** Controls which item is open. Omit to let the accordion manage its own state. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  /** Allows closing the open item by activating it again. Defaults to `false`. */
  collapsible?: boolean;
}

export interface AccordionMultipleProps {
  /** Any number of items can be open at once. */
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> &
  (AccordionSingleProps | AccordionMultipleProps);

// The public `AccordionProps` union keeps `value`/`defaultValue`/
// `onValueChange`'s shape honest at call sites (string for `type="single"`,
// string[] for `type="multiple"`) — internally, `Accordion` just needs a
// single normalized-to-array view of the same fields, so it reads props
// through this shape instead of re-deriving it per branch.
interface AccordionNormalizedProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  type: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[] | undefined) => void;
  collapsible?: boolean;
}

/**
 * A vertically stacked set of interactive headings that each reveal a
 * section of content, built on the WAI-ARIA Accordion pattern (`h3` +
 * `button[aria-expanded]` + `div[role="region"]`). Compose it with
 * `AccordionItem`, `AccordionHeader`, `AccordionTrigger`, and
 * `AccordionContent`. Defaults to `type="single"` (one item open at a
 * time); pass `type="multiple"` to allow several items open together.
 */
export function Accordion(props: AccordionProps) {
  const {
    className,
    children,
    type = "single",
    value,
    defaultValue,
    onValueChange,
    collapsible,
    ...rest
  } = props as AccordionNormalizedProps;

  const isMultiple = type === "multiple";

  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(() =>
    normalizeValue(defaultValue),
  );

  const isControlled = value !== undefined;
  const openValues = isControlled ? normalizeValue(value) : uncontrolledValues;

  const setOpenValues = (next: string[]) => {
    if (!isControlled) setUncontrolledValues(next);
    onValueChange?.(isMultiple ? next : next[0]);
  };

  const toggle = (itemValue: string) => {
    const open = openValues.includes(itemValue);
    if (isMultiple) {
      setOpenValues(
        open ? openValues.filter((v) => v !== itemValue) : [...openValues, itemValue],
      );
      return;
    }
    if (open) {
      if (collapsible) setOpenValues([]);
      return;
    }
    setOpenValues([itemValue]);
  };

  return (
    <AccordionContext.Provider
      value={{ isOpen: (v) => openValues.includes(v), toggle }}
    >
      <div className={mergeClassNames("flex flex-col", className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Identifies this item — the value passed around by `Accordion`'s `value`/`onValueChange`. */
  value: string;
}

/** One entry in the accordion. Compose with `AccordionHeader` and `AccordionContent`. */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const idPrefix = useId();
    return (
      <AccordionItemContext.Provider
        value={{
          value,
          triggerId: `${idPrefix}-trigger`,
          contentId: `${idPrefix}-content`,
        }}
      >
        <div
          ref={ref}
          className={mergeClassNames(
            "border-b border-slate-200 last:border-b-0 dark:border-slate-800",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

export type AccordionHeaderProps = HTMLAttributes<HTMLHeadingElement>;

/**
 * Wraps `AccordionTrigger` in a heading, per the WAI-ARIA Accordion
 * pattern. Renders an `h3` — nest `AccordionItem`s under an appropriate
 * heading level in your page's own outline.
 */
export const AccordionHeader = forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={mergeClassNames("flex", className)} {...props} />
  ),
);
AccordionHeader.displayName = "AccordionHeader";

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Toggles its item open/closed when clicked. Renders a native `<button>`. */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, onClick, type = "button", children, ...props }, ref) => {
    const { isOpen, toggle } = useAccordionContext("AccordionTrigger");
    const { value, triggerId, contentId } = useAccordionItemContext("AccordionTrigger");
    const open = isOpen(value);

    return (
      <button
        ref={ref}
        type={type}
        id={triggerId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle(value);
        }}
        className={mergeClassNames(
          "flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium text-slate-950 transition-colors hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-white dark:hover:text-slate-300 dark:focus-visible:outline-white dark:disabled:text-slate-600",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          className={mergeClassNames(
            "h-4 w-4 shrink-0 text-slate-500 transition-[color,transform] duration-200 motion-reduce:transition-none dark:text-slate-400",
            open && "rotate-180",
          )}
        />
      </button>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export type AccordionContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The collapsible panel revealed by `AccordionTrigger`. Height is
 * animated with a `grid-template-rows` transition (0fr → 1fr) rather than
 * animating to `height: auto` directly, since `auto` isn't a transitionable
 * value; `motion-reduce:` drops the transition entirely for
 * prefers-reduced-motion (WCAG 2.3.3). While closed the panel is `inert`,
 * so content clipped by the collapsed row can't be tabbed to or exposed to
 * assistive tech even though it's still in the DOM for the transition.
 */
export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useAccordionContext("AccordionContent");
    const { value, triggerId, contentId } = useAccordionItemContext("AccordionContent");
    const open = isOpen(value);

    return (
      <div
        inert={open ? undefined : true}
        className={mergeClassNames(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            ref={ref}
            id={contentId}
            role="region"
            aria-labelledby={triggerId}
            className={mergeClassNames(
              "pb-4 text-sm text-slate-500 dark:text-slate-400",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
AccordionContent.displayName = "AccordionContent";
