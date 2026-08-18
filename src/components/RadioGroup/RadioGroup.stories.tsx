import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A set of mutually exclusive options. Compose it with `RadioGroupItem`. Renders native `<input type=\"radio\">`s sharing one `name`, so mutual exclusivity and arrow-key navigation between options both come from the browser. Pair each item with an ordinary `<label>` for its text; there's no bundled label component.",
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
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable" aria-label="Layout density">
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <RadioGroupItem value="compact" />
        Compact
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <RadioGroupItem value="comfortable" />
        Comfortable
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <RadioGroupItem value="spacious" />
        Spacious
      </label>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Entire group disabled
        </p>
        <RadioGroup defaultValue="a" disabled aria-label="Example, entire group disabled">
          <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
            <RadioGroupItem value="a" />
            Option A
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
            <RadioGroupItem value="b" />
            Option B
          </label>
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          One option disabled
        </p>
        <RadioGroup defaultValue="a" aria-label="Example, one option disabled">
          <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
            <RadioGroupItem value="a" />
            Option A
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
            <RadioGroupItem value="b" disabled />
            Option B (unavailable)
          </label>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [plan, setPlan] = useState("pro");
    return (
      <div className="flex flex-col items-center gap-3">
        <RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
          <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
            <RadioGroupItem value="free" />
            Free
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
            <RadioGroupItem value="pro" />
            Pro
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
            <RadioGroupItem value="enterprise" />
            Enterprise
          </label>
        </RadioGroup>
        <p className="text-xs text-slate-500 dark:text-slate-400">Selected: {plan}</p>
      </div>
    );
  },
};
