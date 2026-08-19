import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxTriggerIcon } from "./Combobox";

const meta: Meta<typeof Combobox> = {
  title: "Components/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A searchable, filterable `Select` — typing narrows the options down to ones matching what's typed. Compose it with `ComboboxInput`, `ComboboxContent`, `ComboboxItem`, and `ComboboxEmpty`.",
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
type Story = StoryObj<typeof Combobox>;

const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Date", "Elderberry"];

export const Default: Story = {
  render: () => (
    <label className="flex w-64 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Combobox>
        <div className="relative">
          <ComboboxInput placeholder="Search fruit..." className="pr-8" />
          <ComboboxTriggerIcon className="absolute top-1/2 right-3 -translate-y-1/2" />
        </div>
        <ComboboxContent>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit.toLowerCase()}>
              {fruit}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </label>
  ),
};

export const WithADefaultValue: Story = {
  name: "With a default value",
  render: () => (
    <label className="flex w-64 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Combobox defaultValue="banana">
        <div className="relative">
          <ComboboxInput placeholder="Search fruit..." className="pr-8" />
          <ComboboxTriggerIcon className="absolute top-1/2 right-3 -translate-y-1/2" />
        </div>
        <ComboboxContent>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit.toLowerCase()}>
              {fruit}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </label>
  ),
};

// The same real-Chromium verification approach every other native-popover-
// based component's "Interactive" story uses — jsdom doesn't implement the
// Popover API at all.
export const Interactive: Story = {
  render: () => (
    <label className="flex w-64 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Combobox>
        <div className="relative">
          <ComboboxInput placeholder="Search fruit..." className="pr-8" />
          <ComboboxTriggerIcon className="absolute top-1/2 right-3 -translate-y-1/2" />
        </div>
        <ComboboxContent>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit.toLowerCase()}>
              {fruit}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </label>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(input);
    const listbox = await canvas.findByRole("listbox");
    await waitFor(() => expect(listbox).toBeVisible());
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(canvas.getAllByRole("option")).toHaveLength(fruits.length);

    await userEvent.type(input, "berr");
    await waitFor(() => expect(canvas.getAllByRole("option")).toHaveLength(2));
    expect(canvas.getByRole("option", { name: "Blueberry" })).toBeInTheDocument();
    expect(canvas.getByRole("option", { name: "Elderberry" })).toBeInTheDocument();

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(input).toHaveAttribute("aria-activedescendant", canvas.getByRole("option", { name: "Elderberry" }).id),
    );

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    expect(input).toHaveValue("Elderberry");
    expect(input).toHaveAttribute("aria-expanded", "false");
  },
};
