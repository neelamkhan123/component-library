import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Avatar, AvatarFallback } from "../Avatar/Avatar";
import { buttonVariants } from "../Button/Button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A click-triggered panel of arbitrary rich content — a profile card, a small form, anything that isn't a fixed list of options (`Select`) and isn't urgent enough to interrupt the page (`Dialog`). Compose it with `PopoverTrigger`, `PopoverContent`, and (optionally) `PopoverClose`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-48 items-start justify-center pt-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const ProfileCard: Story = {
  name: "A profile card",
  render: () => (
    <Popover>
      <PopoverTrigger className="rounded-full">
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Jane Doe</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">@janedoe</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Building accessible component libraries, one native element at a time.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const FormInsideAPopover: Story = {
  name: "A form inside a trigger",
  render: () => (
    <Popover>
      <PopoverTrigger className={buttonVariants({ variant: "outline" })}>Set dimensions</PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Dimensions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set the width and height for the layer.</p>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            Width
            <input
              defaultValue="100%"
              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            Height
            <input
              defaultValue="25px"
              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <PopoverClose className={buttonVariants({ variant: "default", size: "sm" })}>Save</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// The same real-Chromium verification approach ContextMenu's, DropdownMenu's,
// and Select's own "Interactive" stories use — jsdom doesn't implement the
// Popover API at all, so this is what actually exercises the native
// showPopover()/toggle-event/focus-return behavior for real.
export const Interactive: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger className={buttonVariants({ variant: "outline" })}>Open popover</PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">Some popover content.</p>
        <PopoverClose className={`mt-3 ${buttonVariants({ variant: "outline", size: "sm" })}`}>
          Close
        </PopoverClose>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open popover" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    const panel = await canvas.findByRole("dialog");
    await waitFor(() => expect(panel).toBeVisible());
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Opening focuses the first focusable thing inside — here, the close button.
    await expect(canvas.getByRole("button", { name: "Close" })).toHaveFocus();

    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Closing (from any path) returns focus to the trigger.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
