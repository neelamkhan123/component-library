import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A thin dividing line. Renders a native `<hr>`. `orientation` accepts `"horizontal"` (the default) or `"vertical"`; `decorative` (default `true`) hides it from assistive tech for purely visual dividers.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-sm items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <div className="w-full">
      <div className="text-sm text-slate-950 dark:text-white">A section of content</div>
      <Separator className="my-4" />
      <div className="text-sm text-slate-950 dark:text-white">Another section, below the line</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-4 text-sm text-slate-950 dark:text-white">
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
      <Separator orientation="vertical" />
      <span>Changelog</span>
    </div>
  ),
};

export const InsideACard: Story = {
  name: "Dividing a card's sections",
  render: () => (
    <div className="w-full rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-950 dark:text-white">Team Settings</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Manage your team's preferences.</span>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-950 dark:text-white">Danger Zone</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Irreversible actions live here.</span>
      </div>
    </div>
  ),
};
