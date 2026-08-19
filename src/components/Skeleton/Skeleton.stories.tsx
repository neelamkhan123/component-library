import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A pulsing placeholder standing in for content that hasn't loaded yet. No default size — size every instance with `className`.",
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
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const TextLines: Story = {
  name: "A block of text lines",
  render: () => (
    <div className="flex w-full flex-col gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
};

export const CardPreview: Story = {
  name: "A loading card",
  render: () => (
    <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  ),
};

// One `role="status"` region wrapping several skeletons — the accessible
// pattern this component's own doc comment recommends, since an individual
// `Skeleton` deliberately doesn't announce anything on its own.
export const AnnouncedAsLoading: Story = {
  name: "Announced as loading (the accessible pattern)",
  render: () => (
    <div role="status" aria-label="Loading profile" className="flex w-full items-center gap-3">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  ),
};
