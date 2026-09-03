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
    const body = within(document.body);
    const tooltip = await body.findByRole("tooltip");
    await waitFor(() => expect(tooltip).toBeVisible());
    expect(tooltip).toHaveTextContent("Bold");
  },
};
