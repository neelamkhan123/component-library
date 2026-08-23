import type { Meta, StoryObj } from "@storybook/react";
import { Gauge, Timer, Users } from "lucide-react";
import { Skeleton } from "../Skeleton/Skeleton";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Components/Stat Card",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The 'big number, and which way it's going' tile a dashboard overview is built from. The delta never relies on color alone — an arrow carries direction visually and an `sr-only` phrase carries it to assistive tech.",
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
type Story = StoryObj<typeof StatCard>;

const responseTime = [420, 388, 401, 352, 318, 331, 268, 232, 214, 190];

export const Default: Story = {
  args: {
    label: "Active users",
    value: "1,284",
    delta: 0.124,
    deltaLabel: "vs. previous 30 days",
    icon: <Users className="h-4 w-4" />,
  },
};

export const ValueOnly: Story = {
  name: "Value only",
  args: { label: "Total projects", value: "48" },
};

export const DownIsGood: Story = {
  name: "When falling is good news",
  args: {
    label: "Avg. response time",
    value: "190 ms",
    delta: -0.31,
    deltaLabel: "vs. previous 30 days",
    deltaDirection: "down-is-good",
    trend: responseTime,
    icon: <Timer className="h-4 w-4" />,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`deltaDirection` decides the color, because 'up' isn't universally good. Response time falling is an improvement, so this drop is green — hard-coding green-for-up would color half a real dashboard wrong.",
      },
    },
  },
};

export const BadNews: Story = {
  name: "A rise that isn't good news",
  args: {
    label: "Avg. response time",
    value: "512 ms",
    delta: 0.42,
    deltaLabel: "vs. previous 30 days",
    deltaDirection: "down-is-good",
    trend: [190, 214, 232, 268, 331, 318, 352, 401, 388, 512],
    icon: <Timer className="h-4 w-4" />,
  },
};

export const Flat: Story = {
  name: "No change",
  args: { label: "Active projects", value: "18", delta: 0, deltaLabel: "vs. previous 30 days" },
};

export const NeutralDelta: Story = {
  name: "A delta that isn't good or bad",
  args: {
    label: "Total sessions",
    value: "212",
    delta: 0.04,
    deltaDirection: "neutral",
    icon: <Gauge className="h-4 w-4" />,
  },
};

export const CustomFormat: Story = {
  name: "A delta that isn't a percentage",
  args: {
    label: "Team members",
    value: "18",
    delta: 3,
    formatDelta: (delta) => `${delta > 0 ? "+" : ""}${delta}`,
    deltaLabel: "since last week",
  },
};

export const Loading: Story = {
  name: "Loading (compose a Skeleton)",
  render: () => (
    <div role="status" aria-label="Loading metrics" className="w-full">
      <StatCard label="Active users" value={<Skeleton className="h-8 w-24" />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`StatCard` has no loading prop — a `Skeleton` in the `value` slot covers it, and the caller wraps the whole loading region in one `role=\"status\"` rather than having every tile announce separately.",
      },
    },
  },
};

export const KpiRow: Story = {
  name: "A KPI row",
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <StatCard
        label="Active users"
        value="1,284"
        delta={0.124}
        deltaLabel="vs. prev. 30d"
        trend={[980, 1010, 1044, 1102, 1150, 1190, 1240, 1284]}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        label="Avg. response time"
        value="190 ms"
        delta={-0.31}
        deltaLabel="vs. prev. 30d"
        deltaDirection="down-is-good"
        trend={responseTime}
        icon={<Timer className="h-4 w-4" />}
      />
      <StatCard
        label="Active projects"
        value="18"
        delta={0}
        deltaLabel="vs. prev. 30d"
        icon={<Gauge className="h-4 w-4" />}
      />
    </div>
  ),
};
