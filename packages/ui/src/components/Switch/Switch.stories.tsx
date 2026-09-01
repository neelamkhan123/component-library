import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A binary on/off toggle. Renders a native `<input type="checkbox" role="switch">`. Pair it with an ordinary `<label>` for its text — clicking the label text toggles it natively, no extra wiring required.',
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
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
      <Switch defaultChecked />
      Enable notifications
    </label>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <Switch />
        Off
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <Switch defaultChecked />
        On
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
        <Switch disabled />
        Disabled, off
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
        <Switch disabled defaultChecked />
        Disabled, on
      </label>
    </div>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
          <Switch checked={checked} onCheckedChange={setChecked} />
          Airplane mode
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {checked ? "On" : "Off"}
        </p>
      </div>
    );
  },
};
