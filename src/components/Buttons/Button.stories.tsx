import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Image, Loader } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "destructive",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// One story per VARIANT (style) — size defaults to md via Controls
export const Default: Story = {
  args: { children: "Default", variant: "default" },
};
export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};
export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};
export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
};
export const Ghost: Story = { args: { children: "Ghost", variant: "ghost" } };
export const Link: Story = { args: { children: "Link", variant: "link" } };

// One story per SIZE
export const Small: Story = { args: { children: "Small", size: "sm" } };
export const Medium: Story = { args: { children: "Medium", size: "md" } };
export const Large: Story = { args: { children: "Large", size: "lg" } };

// One story per STATE
export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};
export const Loading: Story = {
  args: {
    children: <Loader className="animate-spin [animation-duration:3s]" />,
    loading: true,
  },
};

// One story per CONTENT COMPOSITION
export const WithIcon: Story = {
  args: { children: "Upload", icon: <Image size={16} /> },
};
export const IconOnly: Story = {
  args: {
    icon: <Image size={16} />,
    size: "icon",
    "aria-label": "Upload image",
  },
};
