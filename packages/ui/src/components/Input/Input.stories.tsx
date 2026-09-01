import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A single-line text input. Renders a native `<input>` — `type` (`"email"`, `"password"`, `"search"`, …) and native form behavior pass straight through. `size` accepts `"sm"`, `"md"` (the default), or `"lg"`. Pair it with an ordinary `<label>` for a name; there\'s no bundled label component.',
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
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => <Input placeholder="Email address" className="w-64" />,
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex w-64 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Email address
      <Input type="email" placeholder="jane@example.com" />
    </label>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Input aria-label="Default example" placeholder="Default" />
      <Input aria-label="Disabled example" placeholder="Disabled" disabled />
      <Input aria-label="Disabled with value example" placeholder="Disabled with value" disabled defaultValue="Can't edit this" />
      <Input
        aria-label="Email address"
        placeholder="Invalid"
        defaultValue="not-an-email"
        aria-invalid="true"
        aria-describedby="invalid-hint"
      />
      <p id="invalid-hint" className="text-xs text-red-600 dark:text-red-400">
        Enter a valid email address.
      </p>
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="search" placeholder="Search" />
      <Input type="number" placeholder="Quantity" />
    </div>
  ),
};
