import type { Meta, StoryObj } from "@storybook/react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { buttonVariants } from "../Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./DropdownMenu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A menu revealed by clicking a trigger button. Compose it with `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel`, and `DropdownMenuShortcut`. Built directly on `ContextMenu` — see its docs for the menu panel itself (native popover, roving focus, scroll lock, light-dismiss).',
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
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
        Options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          Rename
          <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Duplicate
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Share</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
        Account
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>neelamkhanwork@gmail.com</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Exercises behavior driven entirely by this component's own code — click
// to open/close, ArrowDown/ArrowUp opening with first/last item focused —
// against real Chromium via `@storybook/addon-vitest`'s `play` functions,
// the same reasoning as ContextMenu's "Interactive" story.
export const Interactive: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
        Options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Options" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    const menu = await canvas.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("menuitem", { name: "Rename" })).toHaveFocus();

    // Clicking the trigger again while open closes it (this runs through
    // this component's own code, not the browser's native light-dismiss —
    // see ContextMenu's DECISIONS.md entry on why that distinction matters
    // for what a `play` function here can actually verify).
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // ArrowDown opens the menu with the first item focused.
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await waitFor(() =>
      expect(canvas.getByRole("menuitem", { name: "Rename" })).toHaveFocus(),
    );

    await userEvent.click(canvas.getByRole("menuitem", { name: "Duplicate" }));
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());

    // ArrowUp opens the menu with the last item focused.
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    await waitFor(() =>
      expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus(),
    );
  },
};
