import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A two-state button — pressed or not — for toolbar-style on/off actions (bold/italic formatting, a view filter), not a form value the way `Checkbox`/`Switch` are. Renders a native `<button aria-pressed>`. `variant` accepts `"default"` or `"outline"`; `size` accepts `"sm"`, `"md"` (the default), `"lg"`, or `"icon"`.',
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
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => <Toggle aria-label="Bold">B</Toggle>,
};

export const InitiallyPressed: Story = {
  render: () => (
    <Toggle aria-label="Bold" defaultPressed>
      B
    </Toggle>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Bold" variant="default">
        B
      </Toggle>
      <Toggle aria-label="Bold" variant="outline">
        B
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Bold" size="sm" defaultPressed>
        B
      </Toggle>
      <Toggle aria-label="Bold" size="md" defaultPressed>
        B
      </Toggle>
      <Toggle aria-label="Bold" size="lg" defaultPressed>
        B
      </Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Bold" disabled>
        B
      </Toggle>
      <Toggle aria-label="Bold" disabled defaultPressed>
        B
      </Toggle>
    </div>
  ),
};

export const IconToolbar: Story = {
  name: "Icon toolbar",
  render: () => (
    <div className="flex gap-1">
      <Toggle aria-label="Bold" size="icon">
        <Bold className="h-4 w-4" aria-hidden="true" />
      </Toggle>
      <Toggle aria-label="Italic" size="icon" defaultPressed>
        <Italic className="h-4 w-4" aria-hidden="true" />
      </Toggle>
      <Toggle aria-label="Underline" size="icon">
        <Underline className="h-4 w-4" aria-hidden="true" />
      </Toggle>
    </div>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Toggle
          aria-label="Bold"
          pressed={pressed}
          onPressedChange={setPressed}
        >
          B
        </Toggle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {pressed ? "Bold on" : "Bold off"}
        </p>
      </div>
    );
  },
};
