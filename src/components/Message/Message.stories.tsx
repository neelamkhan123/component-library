import type { Meta, StoryObj } from "@storybook/react";
import { Attachment } from "../Attachment/Attachment";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/Avatar";
import { Bubble } from "../Bubble/Bubble";
import { Message } from "./Message";

const meta: Meta<typeof Message> = {
  title: "Components/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'One row in a conversation: an optional avatar, an optional sender name/timestamp line, and its content — typically a `Bubble` — as children. `variant` accepts `"incoming"` (the default) or `"outgoing"`, matching `Bubble`\'s own prop.',
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
type Story = StoryObj<typeof Message>;

export const Default: Story = {
  render: () => (
    <Message
      avatar={
        <Avatar size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      }
      sender="Jane"
      timestamp="10:32 AM"
    >
      <Bubble>Hey! Are we still on for tomorrow?</Bubble>
    </Message>
  ),
};

export const Outgoing: Story = {
  render: () => (
    <Message variant="outgoing" timestamp="10:33 AM">
      <Bubble variant="outgoing">Yep, see you at 10.</Bubble>
    </Message>
  ),
};

export const WithoutAvatar: Story = {
  name: "Without an avatar",
  render: () => (
    <Message sender="Jane" timestamp="10:32 AM">
      <Bubble>No avatar needed if you'd rather keep it simple.</Bubble>
    </Message>
  ),
};

export const MultipleBubbles: Story = {
  name: "A burst of messages",
  render: () => (
    <Message
      avatar={
        <Avatar size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      }
      sender="Jane"
      timestamp="10:32 AM"
    >
      <Bubble>Hey!</Bubble>
      <Bubble>Are we still on for tomorrow?</Bubble>
    </Message>
  ),
};

// A worked example putting every chatbox-oriented piece together —
// Avatar, Message, Bubble, and Attachment — as a starting point to build
// a real chat UI from, which is the actual point of these components.
export const FullConversation: Story = {
  name: "A full conversation",
  render: () => (
    <div className="flex w-full flex-col gap-4">
      <Message
        avatar={
          <Avatar size="sm">
            <AvatarImage
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=64&h=64&fit=crop"
              alt="Jane"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        }
        sender="Jane"
        timestamp="10:32 AM"
      >
        <Bubble>Hey! Are we still on for tomorrow?</Bubble>
      </Message>

      <Message variant="outgoing" timestamp="10:33 AM">
        <Bubble variant="outgoing">Yep! I'll send over the deck tonight.</Bubble>
      </Message>

      <Message variant="outgoing" timestamp="10:35 AM">
        <Attachment name="Slides.pdf" size="3.1 MB" url="https://example.com/slides.pdf" />
      </Message>

      <Message
        avatar={
          <Avatar size="sm">
            <AvatarImage
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=64&h=64&fit=crop"
              alt="Jane"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        }
        sender="Jane"
        timestamp="10:36 AM"
      >
        <Bubble>Perfect, got it. See you at 10 👋</Bubble>
      </Message>
    </div>
  ),
};
