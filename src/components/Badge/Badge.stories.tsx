import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A small status pill — a count, a tag, a state label. `variant` accepts `"default"` (the default), `"secondary"`, `"outline"`, or `"destructive"`.',
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
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  render: () => <Badge>Default</Badge>,
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

export const AsACount: Story = {
  name: "As a count",
  render: () => (
    <div className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
      <span>Inbox</span>
      <Badge variant="secondary">12</Badge>
    </div>
  ),
};

export const AsAStatus: Story = {
  name: "As a status",
  render: () => (
    <table className="text-sm text-slate-950 dark:text-white">
      <tbody>
        <tr>
          <td className="pr-3 py-1">Deployment</td>
          <td>
            <Badge variant="default">Live</Badge>
          </td>
        </tr>
        <tr>
          <td className="pr-3 py-1">Migration</td>
          <td>
            <Badge variant="destructive">Failed</Badge>
          </td>
        </tr>
      </tbody>
    </table>
  ),
};
