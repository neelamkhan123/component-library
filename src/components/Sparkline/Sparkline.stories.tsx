import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from "./Sparkline";

const meta: Meta<typeof Sparkline> = {
  title: "Components/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A tiny, axis-less trend line sized to sit inline. Hand-drawn SVG, no charting dependency. Colored with `currentColor`, so tint it with a `text-*` class. Decorative by default — pass `label` only when the trend isn't already written out beside it.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sparkline>;

const responseTime = [420, 388, 401, 352, 318, 331, 268, 232, 214, 190];

export const Default: Story = {
  args: { data: responseTime },
};

export const WithEndPoint: Story = {
  name: "With an end point",
  args: { data: responseTime, showEndPoint: true, className: "h-8 w-32 text-blue-600 dark:text-blue-400" },
};

export const Bars: Story = {
  args: { data: responseTime, variant: "bar", className: "h-8 w-32 text-teal-600 dark:text-teal-500" },
};

export const Flat: Story = {
  name: "A flat series",
  args: { data: [5, 5, 5, 5, 5] },
  parameters: {
    docs: { description: { story: "No range to normalize against, so it's centered — which is what 'no change' looks like." } },
  },
};

export const TooShort: Story = {
  name: "Fewer than two points",
  args: { data: [5] },
  parameters: {
    docs: { description: { story: "Renders nothing: one point is not a trend, and a lone dot would imply one." } },
  },
};

export const InTableRows: Story = {
  name: "Inline in table rows",
  render: () => (
    <table className="w-full text-sm">
      <caption className="sr-only">Pages by average response time</caption>
      <tbody>
        {[
          { page: "/checkout", ms: "190", trend: responseTime },
          { page: "/search", ms: "310", trend: [210, 236, 262, 274, 300, 310] },
          { page: "/settings", ms: "120", trend: [300, 260, 226, 160, 140, 120] },
        ].map((row) => (
          <tr key={row.page} className="border-b border-slate-200 dark:border-slate-800">
            <td className="py-2 pr-4">{row.page}</td>
            <td className="py-2 pr-4 text-right tabular-nums">{row.ms} ms</td>
            <td className="w-24 py-2">
              {/* Decorative: the number is already in the cell beside it. */}
              <Sparkline data={row.trend} className="h-5 w-24 text-slate-400 dark:text-slate-500" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Standalone: Story = {
  name: "Standalone (needs a label)",
  args: {
    data: responseTime,
    label: "Average response time fell from 420 ms to 190 ms over 10 weeks",
    className: "h-10 w-48 text-blue-600 dark:text-blue-400",
  },
  parameters: {
    docs: {
      description: {
        story:
          "With no number written beside it, the sparkline is the content — so it needs an accessible name that states the trend in words.",
      },
    },
  },
};
