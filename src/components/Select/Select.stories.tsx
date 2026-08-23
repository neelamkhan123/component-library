import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A single-value select built from a trigger button and a popup listbox rather than a native `<select>`, whose open dropdown can\'t be restyled in most browsers. Compose it with `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, and `SelectSeparator`. `SelectTrigger` renders `role="combobox"`, which (like native `<select>`) needs an explicit name from a wrapping `<label>` or `aria-label` — its visible text alone isn\'t enough, unlike a plain `<button>`. Every story below wraps it in a `<label>` for that reason.',
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
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <label className="flex w-56 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Select defaultValue="blueberry">
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectContent>
      </Select>
    </label>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <label className="flex w-56 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectContent>
      </Select>
    </label>
  ),
};

export const WithSeparatorAndDisabled: Story = {
  render: () => (
    <label className="flex w-56 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Timezone
      <Select defaultValue="est">
        <SelectTrigger>
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pst">Pacific Time</SelectItem>
          <SelectItem value="mst">Mountain Time</SelectItem>
          <SelectItem value="cst">Central Time</SelectItem>
          <SelectItem value="est">Eastern Time</SelectItem>
          <SelectSeparator />
          <SelectItem value="utc" disabled>
            UTC (unavailable)
          </SelectItem>
        </SelectContent>
      </Select>
    </label>
  ),
};

export const Disabled: Story = {
  render: () => (
    <label className="flex w-56 flex-col gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
      Fruit
      <Select defaultValue="blueberry" disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectContent>
      </Select>
    </label>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [fruit, setFruit] = useState<string | undefined>();
    return (
      <div className="flex flex-col items-center gap-3">
        <label className="flex w-56 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
          Fruit
          <Select value={fruit} onValueChange={setFruit}>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Selected: {fruit ?? "none"}
        </p>
      </div>
    );
  },
};

// Exercises behavior driven by this component's own code — opening at the
// trigger, resuming focus on the selected option, arrow-key roving focus,
// and selecting an item — against real Chromium via
// `@storybook/addon-vitest`'s `play` functions, the same reasoning as
// ContextMenu's and DropdownMenu's "Interactive" stories.
export const Interactive: Story = {
  render: () => (
    <label className="flex w-56 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Select defaultValue="banana">
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectContent>
      </Select>
    </label>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    expect(trigger).toHaveTextContent("Banana");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    const listbox = await canvas.findByRole("listbox");
    await waitFor(() => expect(listbox).toBeVisible());
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Opens focused on the already-selected option, not always the first.
    await expect(canvas.getByRole("option", { name: "Banana" })).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "Blueberry" })).toHaveFocus();

    await userEvent.click(canvas.getByRole("option", { name: "Blueberry" }));

    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    expect(trigger).toHaveTextContent("Blueberry");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Selecting an option returns focus to the trigger, like a native <select>.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
