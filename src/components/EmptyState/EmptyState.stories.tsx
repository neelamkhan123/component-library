import type { Meta, StoryObj } from "@storybook/react";
import { FolderOpen, SearchX } from "lucide-react";
import { Button } from "../Button/Button";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Empty State",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The 'there's nothing here yet' panel for a region with no data. Renders no heading element of its own — pass one as `title` where the surrounding outline calls for it, since only the caller knows the right level.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <FolderOpen className="h-5 w-5" />,
    title: "No projects yet",
    description: "Create your first project and it will show up here.",
    action: <Button size="sm">New project</Button>,
  },
};

export const TitleOnly: Story = {
  name: "Title only",
  args: { title: "Nothing to show" },
};

export const NoMatches: Story = {
  name: "A filter matched nothing (announced)",
  args: {
    icon: <SearchX className="h-5 w-5" />,
    title: "No projects match your filter",
    description: "Try a shorter search term, or widen the date range.",
    live: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`live` makes this a polite live region. Use it when the empty state *replaces* content in place — otherwise the swap is silent to a screen reader. Leave it off for an empty state that's present on first paint.",
      },
    },
  },
};

export const WithHeading: Story = {
  name: "With a real heading",
  args: {
    title: "No team members yet",
    titleAs: "h2",
    description: "People appear here once they accept an invitation.",
  },
};

export const InsideACard: Story = {
  name: "Filling a panel",
  render: () => (
    <div className="w-full rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Recent activity</p>
      <EmptyState
        className="border-0 py-8"
        icon={<FolderOpen className="h-5 w-5" />}
        title="No activity in this period"
        description="Widen the date range to see older activity."
      />
    </div>
  ),
};
