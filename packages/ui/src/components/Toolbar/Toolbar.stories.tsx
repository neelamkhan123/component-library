import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Bold, Highlighter, Italic, MessageCircle, Plus, Settings, Underline } from "lucide-react";
import { Separator } from "../Separator/Separator";
import { Toolbar, ToolbarButton } from "./Toolbar";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A floating, always-icon-only rail of actions docked to a viewport edge (`side`: `"left"` (default), `"right"`, `"top"`, `"bottom"` — orientation follows the edge). Compose it with `ToolbarButton` (an icon + a `label` that doubles as the accessible name and its `Tooltip` text) and, for grouping, the existing `Separator`. Implements the WAI-ARIA Toolbar pattern: one item is in the page\'s Tab sequence at a time, with the matching arrow keys plus Home/End moving between them.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: () => (
    <Toolbar label="Quick actions">
      <ToolbarButton icon={<Plus />} label="New" />
      <ToolbarButton icon={<MessageCircle />} label="Comments" />
      <Separator className="mx-0.5" />
      <ToolbarButton icon={<Settings />} label="Settings" />
    </Toolbar>
  ),
};

export const DockedRight: Story = {
  name: "Docked to the right",
  render: () => (
    <Toolbar label="Quick actions" side="right">
      <ToolbarButton icon={<Plus />} label="New" />
      <ToolbarButton icon={<MessageCircle />} label="Comments" />
      <Separator className="mx-0.5" />
      <ToolbarButton icon={<Settings />} label="Settings" />
    </Toolbar>
  ),
};

export const Horizontal: Story = {
  name: "Docked to the top (horizontal)",
  render: () => (
    <Toolbar label="Formatting" side="top">
      <ToolbarButton icon={<Bold />} label="Bold" />
      <ToolbarButton icon={<Italic />} label="Italic" />
      <ToolbarButton icon={<Underline />} label="Underline" />
      <Separator orientation="vertical" className="my-0.5" />
      <ToolbarButton icon={<Highlighter />} label="Highlight" />
    </Toolbar>
  ),
};

export const DockedBottom: Story = {
  name: "Docked to the bottom (horizontal)",
  render: () => (
    <Toolbar label="Formatting" side="bottom">
      <ToolbarButton icon={<Bold />} label="Bold" />
      <ToolbarButton icon={<Italic />} label="Italic" />
      <ToolbarButton icon={<Underline />} label="Underline" />
    </Toolbar>
  ),
};

export const Disabled: Story = {
  name: "A disabled item is skipped by roving focus",
  render: () => (
    <Toolbar label="Formatting" side="top">
      <ToolbarButton icon={<Bold />} label="Bold" />
      <ToolbarButton icon={<Italic />} label="Italic" disabled />
      <ToolbarButton icon={<Underline />} label="Underline" />
    </Toolbar>
  ),
};

// Exercises this component's own roving-tabIndex/arrow-key mechanism and
// its per-button Tooltip against real Chromium via
// `@storybook/addon-vitest`'s play functions, the same reasoning as this
// library's other "Interactive" stories.
export const Interactive: Story = {
  render: () => (
    <Toolbar label="Formatting" side="top">
      <ToolbarButton icon={<Bold />} label="Bold" />
      <ToolbarButton icon={<Italic />} label="Italic" />
      <ToolbarButton icon={<Underline />} label="Underline" />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    const underline = canvas.getByRole("button", { name: "Underline" });

    // Only one item starts in the page's Tab sequence.
    expect(bold).toHaveAttribute("tabindex", "0");
    expect(italic).toHaveAttribute("tabindex", "-1");
    expect(underline).toHaveAttribute("tabindex", "-1");

    bold.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(italic).toHaveFocus();
    expect(italic).toHaveAttribute("tabindex", "0");
    expect(bold).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("{End}");
    expect(underline).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(bold).toHaveFocus();

    // The Tooltip attached via `TooltipTrigger`'s `asChild` still shows on
    // focus, portaled to `document.body` (see `Tooltip.tsx` for why).
    //
    // Found through the trigger's own `aria-describedby` rather than by
    // role: all three buttons portal a tooltip into the body, and the two
    // this sequence just moved focus away from stay `display: block` — so
    // still in the a11y tree — for the length of their exit transition.
    // Querying the body for "the tooltip" therefore races that transition,
    // and can land on one that is on its way out and will never be visible
    // again. The id is stable and unambiguous. Re-read inside `waitFor` so
    // each attempt re-checks the live element rather than a handle grabbed
    // before the popover had opened.
    const tooltipId = bold.getAttribute("aria-describedby");
    expect(tooltipId).toBeTruthy();
    await waitFor(() => {
      const tooltip = document.getElementById(tooltipId!);
      expect(tooltip).toBeVisible();
      expect(tooltip).toHaveTextContent("Bold");
    });
  },
};
