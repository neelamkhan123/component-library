import type { Meta, StoryObj } from "@storybook/react";
import { Bubble } from "./Bubble";

const meta: Meta<typeof Bubble> = {
  title: "Components/Bubble",
  component: Bubble,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A chat message bubble. `variant` accepts `"incoming"` (the default) or `"outgoing"` — an outgoing bubble aligns itself to the right on its own. Stack a few in a `flex flex-col` and you have a working chat log with no other component needed.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-sm items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Bubble>;

export const Default: Story = {
  render: () => <Bubble>Hey! Are we still on for tomorrow?</Bubble>,
};

export const Outgoing: Story = {
  render: () => <Bubble variant="outgoing">Yep, see you at 10.</Bubble>,
};

export const Conversation: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-2">
      <Bubble>Hey! Are we still on for tomorrow?</Bubble>
      <Bubble variant="outgoing">Yep, see you at 10.</Bubble>
      <Bubble>Perfect, see you then 👋</Bubble>
    </div>
  ),
};
