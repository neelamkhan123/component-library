import type { Meta, StoryObj } from "@storybook/react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./ContextMenu";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/Context Menu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A menu shown at the cursor on right-click, in place of the browser's own context menu. Compose it with `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuLabel`, and `ContextMenuShortcut`. Right-click the trigger area to open it.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Save page as…</ContextMenuItem>
        <ContextMenuItem disabled>Print…</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithLabelsAndDestructive: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Right-click this file
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuItem>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

// Exercises behavior this library doesn't implement itself — the native
// popover's own light-dismiss on Escape — so it needs a real browser rather
// than jsdom. `@storybook/addon-vitest` runs `play` functions in actual
// Chromium, which is the only way to honestly verify this.
export const Interactive: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Right-click here");

    fireEvent.contextMenu(trigger, { clientX: 100, clientY: 100 });
    const menu = await canvas.findByRole("menu");
    // The open transition (opacity/scale) is still running for a moment
    // after the popover becomes present in the DOM, so poll rather than
    // asserting visibility the instant it's found — same reasoning as the
    // Drawer's own tests around its slide-in transition.
    await waitFor(() => expect(menu).toBeVisible());

    // The first item is focused automatically on open.
    await expect(canvas.getByRole("menuitem", { name: "Copy" })).toHaveFocus();

    // ArrowDown moves focus to the next item, wrapping back around.
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Paste" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Copy" })).toHaveFocus();

    // Activating an item calls hidePopover() through this component's own
    // code (ContextMenuItem -> onOpenChange(false) -> the effect in
    // ContextMenuContent), so — unlike Escape or an outside click, which
    // are the browser's native light-dismiss and rely on trusted input
    // events @testing-library/user-event can't produce — this is a real,
    // verifiable check of this component's own close path.
    await userEvent.click(canvas.getByRole("menuitem", { name: "Copy" }));
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
  },
};
