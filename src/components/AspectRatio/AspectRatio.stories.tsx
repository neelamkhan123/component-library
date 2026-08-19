import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./AspectRatio";

const meta: Meta<typeof AspectRatio> = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Constrains its content to a fixed width-to-height `ratio` (a plain number, e.g. `16 / 9`). Defaults to `1` (square).",
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
type Story = StoryObj<typeof AspectRatio>;

export const Video: Story = {
  name: "16 / 9 (video)",
  render: () => (
    <AspectRatio ratio={16 / 9} className="rounded-lg border border-slate-200 dark:border-slate-800">
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=338&fit=crop"
        alt="A mountain landscape"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </AspectRatio>
  ),
};

export const Square: Story = {
  name: "1 / 1 (the default)",
  render: () => (
    <AspectRatio className="rounded-lg border border-slate-200 dark:border-slate-800">
      <img
        src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop"
        alt="A cat"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </AspectRatio>
  ),
};

export const Portrait: Story = {
  name: "3 / 4 (portrait)",
  render: () => (
    <AspectRatio ratio={3 / 4} className="w-40 rounded-lg border border-slate-200 dark:border-slate-800">
      <img
        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=400&fit=crop"
        alt="A portrait"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </AspectRatio>
  ),
};
