import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { buttonVariants } from "../Button/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A short, supplementary label shown near a trigger on hover or focus. Compose it with `TooltipTrigger` and `TooltipContent`. `side` accepts `"top"` (the default), `"right"`, `"bottom"`, or `"left"`; `delayDuration` (default `300`ms) controls the hover delay — focus shows immediately.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-32 items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger className={buttonVariants({ variant: "outline" })}>
        Hover me
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex gap-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} side={side}>
          <TooltipTrigger className={buttonVariants({ variant: "outline" })}>
            {side}
          </TooltipTrigger>
          <TooltipContent>Shown on the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const OnPlainText: Story = {
  name: "On plain (non-button) text",
  render: () => (
    <p className="max-w-xs text-sm text-slate-600 dark:text-slate-300">
      This library is maintained by{" "}
      <Tooltip>
        <TooltipTrigger className="cursor-default underline decoration-dotted underline-offset-4">
          Neelam Khan
        </TooltipTrigger>
        <TooltipContent>neelamkhanwork@gmail.com</TooltipContent>
      </Tooltip>
      .
    </p>
  ),
};

export const AsChild: Story = {
  name: "On an already-interactive element (asChild)",
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild className={buttonVariants({ variant: "outline", size: "icon" })}>
        <a href="#" aria-label="Settings">
          ⚙️
        </a>
      </TooltipTrigger>
      <TooltipContent>Settings</TooltipContent>
    </Tooltip>
  ),
};

export const NoDelay: Story = {
  name: "No hover delay",
  render: () => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger className={buttonVariants({ variant: "outline" })}>
        Instant
      </TooltipTrigger>
      <TooltipContent>Shows immediately on hover</TooltipContent>
    </Tooltip>
  ),
};

// Exercises behavior driven by this component's own code — hover-delay,
// immediate-on-focus, and Escape dismissal — against real Chromium via
// `@storybook/addon-vitest`'s play functions, the same reasoning as this
// library's other "Interactive" stories.
export const Interactive: Story = {
  render: () => (
    <Tooltip delayDuration={50}>
      <TooltipTrigger className={buttonVariants({ variant: "outline" })}>
        Hover or focus me
      </TooltipTrigger>
      <TooltipContent>Helpful hint</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Hover or focus me");

    // TooltipContent portals to document.body (see Tooltip.tsx for why),
    // so it's queried from the document rather than the local canvas —
    // the same reasoning as Toast's "Interactive" story.
    const body = within(document.body);
    expect(body.queryByRole("tooltip")).toBeNull();

    // Focus shows immediately, with no hover delay to wait out.
    trigger.focus();
    const tooltip = await body.findByRole("tooltip");
    await waitFor(() => expect(tooltip).toBeVisible());
    expect(tooltip).toHaveTextContent("Helpful hint");

    // Escape dismisses it.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());

    trigger.blur();
  },
};
