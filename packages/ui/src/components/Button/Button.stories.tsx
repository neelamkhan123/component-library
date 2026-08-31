import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Image, Loader } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A versatile, accessible button. Choose a `variant` for visual style, a `size` for dimensions, and optionally pass an `icon` or set `loading`.",
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
  argTypes: {
    variant: {
      control: "select",
      description: "Visual style of the button.",
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
      description: "Size of the button, including a square icon-only size.",
      options: ["sm", "md", "lg", "icon"],
    },
    icon: {
      control: false,
      description: "Icon or image rendered before the label.",
    },
    loading: {
      control: "boolean",
      description: "Shows a busy state and disables the button.",
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
    children: "Loading",
    icon: <Loader className="animate-spin [animation-duration:3s]" size={16} />,
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
