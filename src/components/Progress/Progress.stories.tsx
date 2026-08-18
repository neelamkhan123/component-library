import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A progress bar. `value` (0 to `max`, which defaults to 100) fills the bar; omit it for an indeterminate/loading state.",
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
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => <Progress value={60} className="w-full" />,
};

export const Values: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-3">
      <Progress value={0} />
      <Progress value={33} />
      <Progress value={66} />
      <Progress value={100} />
    </div>
  ),
};

export const Indeterminate: Story = {
  name: "Indeterminate (no value yet)",
  render: () => <Progress className="w-full" />,
};

export const CustomMax: Story = {
  name: "A custom max (e.g. steps completed)",
  render: () => <Progress value={3} max={5} className="w-full" />,
};

// A file upload is the most common reason a chatbox needs a progress bar —
// this ties it to `Attachment`, which stages exactly this kind of pending
// file. No new state-management component needed, just `useState` ticking
// on an interval, same as `Switch`'s "Controlled" story keeping its own
// local state.
export const SimulatedUpload: Story = {
  name: "A simulated upload",
  render: function Render() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (progress >= 100) return;
      const id = setInterval(() => {
        setProgress((current) => Math.min(current + 10, 100));
      }, 300);
      return () => clearInterval(id);
    }, [progress]);

    return (
      <div className="flex w-full flex-col gap-2">
        <Progress value={progress} className="w-full" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {progress < 100 ? `Uploading… ${progress}%` : "Upload complete"}
        </p>
      </div>
    );
  },
};
