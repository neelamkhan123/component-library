import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A round image placeholder for a user or entity. Compose it with `AvatarImage` and `AvatarFallback` — the fallback is shown until the image finishes loading, and again if it fails to load. `size` accepts `"sm"`, `"md"` (the default), or `"lg"`.',
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
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=128&h=128&fit=crop"
        alt="Portrait of a user"
      />
      <AvatarFallback>UN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  name: "Fallback (broken image)",
  render: () => (
    <Avatar>
      <AvatarImage src="https://broken.example/does-not-exist.jpg" alt="" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="md">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-3">
      <Avatar className="ring-2 ring-white dark:ring-slate-950">
        <AvatarFallback>AK</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-white dark:ring-slate-950">
        <AvatarFallback>BL</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-white dark:ring-slate-950">
        <AvatarFallback>CM</AvatarFallback>
      </Avatar>
    </div>
  ),
};
