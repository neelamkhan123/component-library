import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateRangePicker, defaultDateRangePresets, type DateRange } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/Date Range Picker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The time-period filter a dashboard is read through — a trigger showing the current range, relative presets, and a custom from/to range below them. Assembled from `Popover`, two `Calendar`s, and `RadioGroup`: making the presets real `<input type=\"radio\">`s means arrow-key navigation, mutual exclusivity, and the “3 of 5” announcement all come from the browser. Two calendars rather than one grid with range-painting hover, because hover preview is invisible to keyboard and touch users and unannounced to assistive tech.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-96 w-full max-w-md items-start justify-center pt-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  args: { defaultValue: defaultDateRangePresets[1].getRange() },
};

export const Empty: Story = {
  name: "Nothing selected yet",
  args: {},
};

export const Controlled: Story = {
  render: function ControlledPicker() {
    const [range, setRange] = useState<DateRange>(defaultDateRangePresets[0].getRange());
    return (
      <div className="flex flex-col items-center gap-3">
        <DateRangePicker value={range} onValueChange={setRange} />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {range.from.toDateString()} → {range.to.toDateString()}
        </p>
      </div>
    );
  },
};

export const NoFutureDates: Story = {
  name: "Blocking future dates",
  args: {
    defaultValue: defaultDateRangePresets[1].getRange(),
    disabled: (date: Date) => date > new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: "Dashboard data doesn't exist for tomorrow, so `disabled` takes the future out of both grids.",
      },
    },
  },
};

export const CustomPresets: Story = {
  name: "Custom presets",
  args: {
    presets: [
      { label: "Today", getRange: () => ({ from: new Date(), to: new Date() }) },
      {
        label: "This sprint",
        getRange: () => {
          const to = new Date();
          const from = new Date();
          from.setDate(to.getDate() - 13);
          return { from, to };
        },
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Presets hold a *function*, not a range, so “This sprint” is recomputed on selection and can't silently mean last sprint in a tab left open overnight.",
      },
    },
  },
};

export const CustomRangeOnly: Story = {
  name: "Custom range only",
  args: { presets: [], defaultValue: defaultDateRangePresets[0].getRange() },
};
