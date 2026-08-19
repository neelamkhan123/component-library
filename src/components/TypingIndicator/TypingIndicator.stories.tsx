import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback } from "../Avatar/Avatar";
import { Bubble } from "../Bubble/Bubble";
import { Message } from "../Message/Message";
import { TypingIndicator } from "./TypingIndicator";

const meta: Meta<typeof TypingIndicator> = {
  title: "Components/TypingIndicator",
  component: TypingIndicator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Three bouncing dots in a bubble — the "someone is typing" indicator, styled to match `Bubble`\'s own incoming shape.',
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
type Story = StoryObj<typeof TypingIndicator>;

export const Default: Story = {
  render: () => <TypingIndicator />,
};

export const WithAName: Story = {
  name: "With a name for assistive tech",
  render: () => <TypingIndicator label="Jane is typing…" />,
};

// Where this actually belongs — standing in for a Bubble that hasn't
// arrived yet, in the same Message row an incoming reply would use.
export const InAConversation: Story = {
  name: "In a conversation",
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Message
        avatar={
          <Avatar size="sm">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        }
        sender="Jane"
      >
        <Bubble>Hey, are you free to review my PR?</Bubble>
      </Message>
      <Message
        avatar={
          <Avatar size="sm">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        }
      >
        <TypingIndicator label="Jane is typing…" />
      </Message>
    </div>
  ),
};
