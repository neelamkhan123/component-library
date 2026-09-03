import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { PanelLeft } from "lucide-react";
import { mergeClassNames } from "../../utils/mergeClassNames";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip";

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(component: string): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      `<${component} /> must be rendered inside a <SidebarProvider>.`,
    );
  }
  return context;
}

interface SidebarPanelContextValue {
  /**
   * True while this `Sidebar` is collapsed to its icon rail
   * (`collapsible="icon"` and closed). `SidebarMenuButton` reads it to hide
   * its label (kept for assistive tech, resurfaced as a `Tooltip` on
   * hover/focus) and `SidebarGroupLabel` reads it to hide entirely, since
   * neither has room in a rail this narrow.
   */
  iconOnly: boolean;
  /** Which edge the enclosing `Sidebar` is docked to, so an icon-only `SidebarMenuButton`'s tooltip opens away from the panel rather than back over it. */
  side: "left" | "right";
}

// A plain default (not `| null` + a throwing hook like `SidebarContext`)
// deliberately: reading "am I inside an icon-rail Sidebar?" is an opt-in
// enhancement `SidebarMenuButton`/`SidebarGroupLabel` make for themselves,
// not a requirement every consumer must satisfy the way the state
// `SidebarProvider` itself owns is.
const SidebarPanelContext = createContext<SidebarPanelContextValue>({
  iconOnly: false,
  side: "left",
});

/** Reads the current open state and exposes a setter/toggle, for wiring up a custom control `SidebarTrigger` doesn't already cover. */
export function useSidebar(): SidebarContextValue {
  return useSidebarContext("useSidebar()");
}

export interface SidebarProviderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Controls the open state. Omit to let the sidebar manage its own state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `true` — unlike `Dialog`, a docked sidebar is normally visible from the start. */
  defaultOpen?: boolean;
  /** Called whenever the open state changes, whether from `SidebarTrigger` or `useSidebar()`. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * The context and outer flex layout for a `Sidebar` and its main content
 * together — compose it as `<SidebarProvider><Sidebar>...</Sidebar><main
 * className="flex-1">...</main></SidebarProvider>`. Unlike `Dialog` (whose
 * provider holds only context, since `DialogContent` portals-in-place via
 * the native top layer), a docked sidebar and its content are ordinary
 * flex siblings that need a shared row wrapper — so this component renders
 * that wrapper itself rather than leaving it to the caller.
 */
export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : uncontrolledOpen;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const toggleSidebar = useCallback(() => setOpen(!open), [open, setOpen]);

    return (
      <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
        <div
          ref={ref}
          className={mergeClassNames("flex min-h-svh w-full", className)}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Which edge the sidebar is docked to. Defaults to `"left"`. */
  side?: "left" | "right";
  /** The sidebar's width while open, as a CSS length. Defaults to `"16rem"`. */
  width?: string;
  /**
   * How the panel behaves while closed. `"offcanvas"` (the default) is the
   * original behavior: collapse all the way to a hidden `0`-width panel,
   * `inert` and out of the accessibility tree. `"icon"` collapses to a
   * slim, still-visible-and-interactive icon rail instead — see
   * `iconWidth`, and `SidebarMenuButton`/`SidebarGroupLabel` for how their
   * content adapts to it.
   */
  collapsible?: "offcanvas" | "icon";
  /**
   * The panel's width while collapsed with `collapsible="icon"`. Ignored
   * (and unused) for `"offcanvas"`, which always collapses to `0`. Defaults
   * to `"4rem"` — deliberately roomier than it might look needed for a
   * single `h-8 w-8` icon: `SidebarContent`'s own `p-3` padding still
   * applies inside the rail, and the default leaves real breathing room
   * either side of the icon rather than a bare, exact fit.
   */
  iconWidth?: string;
}

/**
 * A docked, collapsible-width navigation panel. Renders a native `<aside>`
 * — its implicit `complementary` landmark role needs no `role` attribute of
 * its own, the same reasoning `Breadcrumb` renders a plain `<nav>`.
 *
 * Width is set via inline `style`, not a Tailwind `w-*` class, because it is
 * animated per-`open`-state rather than fixed — a caller changes it with the
 * `width` prop. (Overriding it with a `w-*` class works too: `mergeClassNames`
 * resolves conflicting utilities so the caller's class wins.)
 *
 * The `<aside>` carries no height utility of its own; as a flex item of
 * `SidebarProvider` it stretches to whatever height that container has. That
 * keeps it viewport-tall in a normal app shell (where the provider's
 * `min-h-svh` applies) without forcing `100svh` on it when the provider is
 * deliberately sized smaller — an embedded preview, a card, a split pane.
 *
 * The `open`-driven width collapses on the `<aside>` itself (`overflow-hidden`,
 * `transition-[width]`); its children sit inside an inner `<div>` held at a
 * *constant* width instead of collapsing with it, so header/nav text doesn't
 * visibly reflow and wrap mid-animation as the outer width crosses down
 * toward `0`. When collapsed, the whole panel is also marked `inert`
 * (React 19's direct support for the native attribute) — still present for
 * the closing transition, but unreachable by keyboard or assistive tech
 * while invisible, the same problem `Dialog`/`Drawer` solve by fully
 * removing their content from the accessibility tree on close.
 *
 * `collapsible="icon"` changes what "collapsed" animates *to* — the icon
 * rail width instead of `0` — and changes two things that follow from
 * that: `inert` no longer applies while collapsed (the rail stays visible
 * and clickable, unlike a fully hidden offcanvas panel), and the inner
 * width-holding wrapper tracks the rail width too, since its job there is
 * different. In `"offcanvas"` mode that wrapper stays pinned at the full
 * open `width` specifically so text doesn't visibly reflow while the
 * `<aside>` slides toward invisible `0`; in `"icon"` mode there's no slide
 * to protect — content genuinely restyles into the rail (labels hidden via
 * `SidebarPanelContext`, not clipped offscreen), so the wrapper is free to
 * animate down to `iconWidth` alongside it.
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      side = "left",
      width = "16rem",
      collapsible = "offcanvas",
      iconWidth = "4rem",
      style,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { open } = useSidebarContext("Sidebar");
    const collapsedWidth = collapsible === "icon" ? iconWidth : "0";
    return (
      <SidebarPanelContext.Provider
        value={{ iconOnly: collapsible === "icon" && !open, side }}
      >
        <aside
          ref={ref}
          inert={collapsible === "offcanvas" && !open ? true : undefined}
          data-state={open ? "open" : "collapsed"}
          data-collapsible={collapsible}
          style={{ width: open ? width : collapsedWidth, ...style }}
          className={mergeClassNames(
            "flex shrink-0 flex-col overflow-hidden bg-white text-slate-950 transition-[width] duration-200 ease-out motion-reduce:transition-none dark:bg-slate-950 dark:text-white",
            side === "right"
              ? "order-last border-l border-slate-200 dark:border-slate-800"
              : "border-r border-slate-200 dark:border-slate-800",
            className,
          )}
          {...props}
        >
          <div
            className="flex h-full flex-col"
            style={{
              width:
                collapsible === "icon" ? (open ? width : iconWidth) : width,
            }}
          >
            {children}
          </div>
        </aside>
      </SidebarPanelContext.Provider>
    );
  },
);
Sidebar.displayName = "Sidebar";

export type SidebarTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Toggles the sidebar open/closed. Renders a native `<button>` with a `PanelLeft` icon; override `aria-label` if `"Toggle sidebar"` doesn't fit. */
export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(
  (
    {
      onClick,
      type = "button",
      "aria-label": ariaLabel = "Toggle sidebar",
      className,
      ...props
    },
    ref,
  ) => {
    const { toggleSidebar } = useSidebarContext("SidebarTrigger");
    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggleSidebar();
        }}
        className={mergeClassNames(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
          className,
        )}
        {...props}
      >
        <PanelLeft className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;

/** The sidebar's top region — typically a logo/workspace switcher/`SidebarTrigger`. */
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames("flex shrink-0 flex-col gap-2 p-3", className)}
      {...props}
    />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

export type SidebarContentProps = HTMLAttributes<HTMLDivElement>;

/** The sidebar's scrollable middle region, holding its `SidebarGroup`s. */
export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames(
        "flex flex-1 flex-col gap-4 overflow-y-auto p-3",
        className,
      )}
      {...props}
    />
  ),
);
SidebarContent.displayName = "SidebarContent";

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;

/** The sidebar's bottom region — typically a user/account menu. */
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames(
        "flex shrink-0 flex-col gap-2 border-t border-slate-200 p-3 dark:border-slate-800",
        className,
      )}
      {...props}
    />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

export type SidebarGroupProps = HTMLAttributes<HTMLDivElement>;

/** One labeled section of navigation within `SidebarContent`. */
export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames("flex flex-col gap-1", className)}
      {...props}
    />
  ),
);
SidebarGroup.displayName = "SidebarGroup";

export type SidebarGroupLabelProps = HTMLAttributes<HTMLDivElement>;

/**
 * A `SidebarGroup`'s heading. Purely visual — it isn't wired to its group
 * as an accessible heading/region pair, the same deliberate simplicity
 * `SidebarGroup` itself keeps (see `DECISIONS.md`). Renders nothing at all
 * in an icon-collapsed `Sidebar` (`collapsible="icon"`, closed) — there's
 * no room for a text heading in a rail that narrow, and unlike
 * `SidebarMenuButton` there's no icon standing in for it to attach a
 * `Tooltip` to instead.
 */
export const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  SidebarGroupLabelProps
>(({ className, ...props }, ref) => {
  const { iconOnly } = useContext(SidebarPanelContext);
  if (iconOnly) return null;
  return (
    <div
      ref={ref}
      className={mergeClassNames(
        "px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export type SidebarMenuProps = HTMLAttributes<HTMLUListElement>;

/** The list of `SidebarMenuItem`s within a `SidebarGroup` (or `SidebarContent` directly). Renders a native `<ul>`. */
export const SidebarMenu = forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={mergeClassNames("flex flex-col gap-0.5", className)}
      {...props}
    />
  ),
);
SidebarMenu.displayName = "SidebarMenu";

export type SidebarMenuItemProps = HTMLAttributes<HTMLLIElement>;

/** One entry in a `SidebarMenu`. Renders a native `<li>`. */
export const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={className} {...props} />
  ),
);
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks this as the current page: sets `aria-current="page"` and highlights it. */
  isActive?: boolean;
  /** An icon shown before the label. */
  icon?: ReactNode;
}

/**
 * A navigable entry in a `SidebarMenu`. Renders a native `<a>`, the same
 * call `BreadcrumbLink` makes and for the same reason: a sidebar's entries
 * overwhelmingly represent real, distinct pages/routes, arguably even more
 * consistently than a breadcrumb trail does — unlike `PaginationLink`, which
 * deliberately renders a `<button>` because whether changing pages should
 * navigate genuinely varies by app. Pass `href` to make it a real link (an
 * `<a>` with none isn't keyboard-focusable, the same trap `PaginationLink`'s
 * own docs warn about).
 *
 * Inside an icon-collapsed `Sidebar` (`collapsible="icon"`, closed), the
 * label isn't dropped — it's kept `sr-only` (so the link's accessible name
 * is still its full text, exactly as before) and resurfaces visually as a
 * `Tooltip` on hover/focus instead. That tooltip wraps the `<a>` itself via
 * `TooltipTrigger`'s `asChild`, not an extra `<span tabIndex={0}>` around
 * it — this stays the one and only focusable node it always was, just with
 * a floating label attached.
 */
export const SidebarMenuButton = forwardRef<
  HTMLAnchorElement,
  SidebarMenuButtonProps
>(({ isActive = false, icon, className, children, ...props }, ref) => {
  const { iconOnly, side } = useContext(SidebarPanelContext);
  const link = (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={mergeClassNames(
        "flex items-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] dark:hover:bg-slate-800 dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
        // `justify-center` alone isn't enough once collapsed: the row still
        // spans the full (narrow) rail width, and with the icon plus the
        // row's own `px-2` padding together wider than what's left after
        // `SidebarContent`'s own `p-3`, the browser has negative free space
        // to distribute — found directly in a real icon-rail screenshot,
        // where `justify-content` silently falls back to flex-start rather
        // than centering an item that overflows its container, per the CSS
        // Box Alignment spec's overflow-safe behavior. A fixed `h-8 w-8`
        // box (the same size `SidebarTrigger` already uses) sidesteps the
        // arithmetic entirely — it's centered via `mx-auto` in a row with
        // no horizontal padding of its own to fight, and `iconWidth`'s
        // `"4rem"` default leaves it real breathing room either way.
        iconOnly ? "mx-auto h-8 w-8 justify-center p-0" : "px-2 py-1.5",
        isActive
          ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white"
          : "text-slate-600 dark:text-slate-300",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
    </a>
  );

  if (!iconOnly) return link;

  // Tooltip opens away from the panel — toward the main content, not
  // back over the rail it's docked to — the same "point outward" logic
  // a callout on a right-docked `Sidebar` would want mirrored.
  return (
    <Tooltip side={side === "right" ? "left" : "right"}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";
