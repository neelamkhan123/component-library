import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Attachment } from "../Attachment/Attachment";
import { Avatar, AvatarFallback } from "../Avatar/Avatar";
import { Bubble } from "../Bubble/Bubble";
import { Message } from "../Message/Message";
import { TypingIndicator } from "../TypingIndicator/TypingIndicator";
import { Composer } from "./Composer";

const meta: Meta<typeof Composer> = {
  title: "Components/Composer",
  component: Composer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`Textarea` and a send button, wired together. Grows with its content up to `maxHeight`, then scrolls. Enter submits; Shift+Enter inserts a newline.",
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
type Story = StoryObj<typeof Composer>;

export const Default: Story = {
  render: function Render() {
    const [lastSent, setLastSent] = useState<string | null>(null);
    return (
      <div className="flex w-full flex-col gap-2">
        <Composer placeholder="Type a message…" onSubmit={setLastSent} />
        {lastSent ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Sent: "{lastSent}"</p>
        ) : null}
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <Composer placeholder="You've been muted" disabled />,
};

// Every chatbox-oriented piece this library has, composed together —
// Attachment, Avatar, Bubble, Message, TypingIndicator, and Composer — the
// same worked-example spirit Message's own "A full conversation" story
// already has, now with somewhere to actually type a reply.
export const InAConversation: Story = {
  name: "In a full conversation",
  render: function Render() {
    const [messages, setMessages] = useState([
      { id: 1, from: "them" as const, text: "Hey! Are we still on for tomorrow?" },
      { id: 2, from: "me" as const, text: "Yep! I'll send over the deck tonight." },
    ]);
    const [typing, setTyping] = useState(false);

    function handleSubmit(value: string) {
      setMessages((current) => [...current, { id: current.length + 1, from: "me", text: value }]);
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    }

    return (
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-2">
          {messages.map((message) =>
            message.from === "them" ? (
              <Message
                key={message.id}
                avatar={
                  <Avatar size="sm">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                }
                sender="Jane"
              >
                <Bubble>{message.text}</Bubble>
              </Message>
            ) : (
              <Message key={message.id} variant="outgoing">
                <Bubble variant="outgoing">{message.text}</Bubble>
              </Message>
            ),
          )}
          <Message variant="outgoing">
            <Attachment name="Slides.pdf" size="3.1 MB" url="https://example.com/slides.pdf" />
          </Message>
          {typing ? (
            <Message
              avatar={
                <Avatar size="sm">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              }
            >
              <TypingIndicator label="Jane is typing…" />
            </Message>
          ) : null}
        </div>
        <Composer placeholder="Type a message…" onSubmit={handleSubmit} />
      </div>
    );
  },
};
