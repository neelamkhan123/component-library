import { forwardRef, useCallback, type ButtonHTMLAttributes } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  useContextMenu,
  type ContextMenuProps,
} from "../ContextMenu/ContextMenu";

export type DropdownMenuProps = ContextMenuProps;

/**
 * A menu revealed by clicking a trigger button, per the WAI-ARIA Menu
 * Button pattern. Compose it with `DropdownMenuTrigger`,
 * `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`,
 * `DropdownMenuLabel`, and `DropdownMenuShortcut`.
 *
 * A dropdown menu is a `ContextMenu` triggered by clicking a real button
 * instead of right-clicking, positioned against that button (below it by
 * default; see `DropdownMenuTrigger`'s `side` prop) instead of at the
 * cursor — everything else about the menu panel (the native popover,
 * its `requestAnimationFrame`-deferred opening, roving keyboard focus,
 * scroll lock, light-dismiss) is identical, so it's built directly on
 * `ContextMenu` rather than a parallel implementation, the same
 * relationship `Drawer` has to `Dialog`.
 */
export function DropdownMenu(props: DropdownMenuProps) {
  return <ContextMenu {...props} />;
}

// A menu item, separator, label, and shortcut look and behave identically
// whether the menu was opened by a right-click or a button click — these
// are the exact same components as their `ContextMenu` counterparts,
// re-exported under dropdown-flavored names.
export const DropdownMenuContent = ContextMenuContent;
export const DropdownMenuItem = ContextMenuItem;
export const DropdownMenuSeparator = ContextMenuSeparator;
export const DropdownMenuLabel = ContextMenuLabel;
export const DropdownMenuShortcut = ContextMenuShortcut;

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Which side of the trigger the menu opens on. Defaults to `"bottom"`.
   *  `"top"` is for a trigger that sits near the bottom of the viewport
   *  (a sidebar footer's account menu, say) — opening below there would
   *  either run off-screen or, once `DropdownMenuContent`'s own clamp
   *  caught that, land pinned to the bottom of the *viewport* rather than
   *  actually next to the trigger. */
  side?: "top" | "bottom";
}

/**
 * Opens the menu when clicked, positioned at the trigger's left edge, on
 * whichever `side` was asked for (clamped to the viewport by
 * `DropdownMenuContent`, same as `ContextMenuContent`, if that would run
 * off-screen). Renders a native `<button>` with
 * `aria-haspopup="menu"`/`aria-expanded`, per the WAI-ARIA Menu Button
 * pattern. Clicking again while open closes it. ArrowDown/ArrowUp open the
 * menu with the first/last item focused respectively, matching the
 * pattern's documented keyboard behavior, without requiring it to already
 * be open — that mapping stays fixed to the *key*, not `side`, since it's
 * about where focus lands, not which way the menu opened.
 */
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ onClick, onKeyDown, type = "button", side = "bottom", ...props }, ref) => {
    const { open, onOpenChange } = useContextMenu();

    const openMenu = useCallback(
      (trigger: HTMLButtonElement, initialFocus?: "first" | "last") => {
        const rect = trigger.getBoundingClientRect();
        if (side === "top") {
          onOpenChange(true, { x: rect.left, y: rect.top - 4, anchor: "bottom", initialFocus });
        } else {
          onOpenChange(true, { x: rect.left, y: rect.bottom + 4, initialFocus });
        }
      },
      [onOpenChange, side],
    );

    return (
      <button
        ref={ref}
        type={type}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (open) onOpenChange(false);
          else openMenu(event.currentTarget);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || open) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu(event.currentTarget, "first");
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(event.currentTarget, "last");
          }
        }}
        {...props}
      />
    );
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
