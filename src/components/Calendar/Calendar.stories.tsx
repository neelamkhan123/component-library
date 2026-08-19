import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CalendarIcon } from "lucide-react";
import { buttonVariants } from "../Button/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";
import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A month grid for picking a single date, per the WAI-ARIA Date Picker Dialog pattern. Arrow keys move focus a day/week at a time, Home/End jump to the start/end of the week, PageUp/PageDown change month.",
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
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<Date | undefined>();
    return <Calendar selected={selected} onSelect={setSelected} />;
  },
};

export const WithADefaultSelection: Story = {
  name: "With a default selection",
  render: () => <Calendar defaultSelected={new Date()} />,
};

export const DisablingPastDates: Story = {
  name: "Disabling past dates",
  render: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return <Calendar disabled={(date) => date < today} />;
  },
};

// Composed with Popover — a trigger button showing the formatted date, the
// calendar itself inside PopoverContent — rather than a separate, all-in-one
// "DatePicker" component. See Calendar's own doc comment for why.
export const AsADatePicker: Story = {
  name: "Composed with Popover, as a date picker",
  render: function Render() {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <Popover>
        <PopoverTrigger className={`${buttonVariants({ variant: "outline" })} justify-start`}>
          <CalendarIcon className="h-4 w-4" aria-hidden="true" />
          {date ? date.toLocaleDateString() : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent className="w-fit p-3">
          <Calendar selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    );
  },
};
