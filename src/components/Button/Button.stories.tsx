import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Click me" },
};

export const Disabled: Story = {
  args: { children: "Click me", disabled: true },
};

export const Loading: Story = {
  args: { children: "Save", loading: true },
};
