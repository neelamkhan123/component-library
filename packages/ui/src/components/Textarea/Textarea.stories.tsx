import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A multi-line text input. Renders a native `<textarea>` — `Input`'s sibling in visual language. Resizes vertically only. Pair it with an ordinary `<label>` for a name; there's no bundled label component.",
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
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => <Textarea placeholder="Write a message…" className="w-72" />,
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex w-72 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Bio
      <Textarea placeholder="Tell us about yourself" rows={4} />
    </label>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Textarea aria-label="Default example" placeholder="Default" />
      <Textarea aria-label="Disabled example" placeholder="Disabled" disabled />
      <Textarea aria-label="Disabled with value example" placeholder="Disabled with value" disabled defaultValue="Can't edit this" />
      <Textarea
        aria-label="Email address"
        placeholder="Invalid"
        defaultValue="too short"
        aria-invalid="true"
        aria-describedby="invalid-hint"
      />
      <p id="invalid-hint" className="text-xs text-red-600 dark:text-red-400">
        Enter at least 100 characters.
      </p>
    </div>
  ),
};

export const Rows: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Textarea placeholder="2 rows" rows={2} />
      <Textarea placeholder="6 rows" rows={6} />
    </div>
  ),
};
