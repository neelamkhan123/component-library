import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, type CheckedState } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A tri-state checkbox: checked, unchecked, or `"indeterminate"`. Renders a real `<input type="checkbox">` restyled with `appearance-none`. Pair it with a `<label>` around both the checkbox and its text — clicking the label text toggles the checkbox natively, no extra wiring required.',
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
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
      <Checkbox defaultChecked />
      Accept the terms and conditions
    </label>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <Checkbox />
        Unchecked
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <Checkbox defaultChecked />
        Checked
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-950 dark:text-white">
        <Checkbox checked="indeterminate" readOnly />
        Indeterminate
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
        <Checkbox disabled />
        Disabled
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600">
        <Checkbox disabled defaultChecked />
        Disabled, checked
      </label>
    </div>
  ),
};

const items = ["Email notifications", "SMS notifications", "Push notifications"];

export const SelectAll: Story = {
  name: "Select all (indeterminate)",
  render: function Render() {
    const [checkedItems, setCheckedItems] = useState<boolean[]>(items.map(() => false));
    const checkedCount = checkedItems.filter(Boolean).length;
    const allChecked: CheckedState =
      checkedCount === 0 ? false : checkedCount === items.length ? true : "indeterminate";

    return (
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
          <Checkbox
            checked={allChecked}
            onCheckedChange={(checked) => setCheckedItems(items.map(() => checked))}
          />
          Select all
        </label>
        <div className="flex flex-col gap-2 pl-6">
          {items.map((item, index) => (
            <label
              key={item}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <Checkbox
                checked={checkedItems[index]}
                onCheckedChange={(checked) =>
                  setCheckedItems((prev) =>
                    prev.map((value, i) => (i === index ? checked : value)),
                  )
                }
              />
              {item}
            </label>
          ))}
        </div>
      </div>
    );
  },
};
