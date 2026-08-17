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
 * instead of right-clicking, positioned below that button instead of at
 * the cursor — everything else about the menu panel (the native popover,
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

export type DropdownMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Opens the menu when clicked, positioned below the trigger's left edge
 * (clamped to the viewport by `DropdownMenuContent`, same as
 * `ContextMenuContent`, if that would run off-screen). Renders a native
 * `<button>` with `aria-haspopup="menu"`/`aria-expanded`, per the WAI-ARIA
 * Menu Button pattern. Clicking again while open closes it. ArrowDown/
 * ArrowUp open the menu with the first/last item focused respectively,
 * matching the pattern's documented keyboard behavior, without requiring
 * it to already be open.
 */
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ onClick, onKeyDown, type = "button", ...props }, ref) => {
    const { open, onOpenChange } = useContextMenu();

    const openBelow = useCallback(
      (trigger: HTMLButtonElement, initialFocus?: "first" | "last") => {
        const rect = trigger.getBoundingClientRect();
        onOpenChange(true, { x: rect.left, y: rect.bottom + 4, initialFocus });
      },
      [onOpenChange],
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
          else openBelow(event.currentTarget);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || open) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openBelow(event.currentTarget, "first");
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openBelow(event.currentTarget, "last");
          }
        }}
        {...props}
      />
    );
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
