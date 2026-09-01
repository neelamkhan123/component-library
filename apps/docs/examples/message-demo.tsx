"use client";

import { Avatar, AvatarFallback, Bubble, Message } from "neelam-ui";

export default function MessageDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Message
        avatar={
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        }
        sender="Ada Lovelace"
        timestamp="09:24"
      >
        <Bubble>Morning — is the API doc ready to review?</Bubble>
      </Message>

      {/* No avatar on your own messages, as most chat UIs do. */}
      <Message variant="outgoing" timestamp="09:26">
        <Bubble variant="outgoing">Pushed it just now.</Bubble>
        <Bubble variant="outgoing">Second half still needs examples.</Bubble>
      </Message>
    </div>
  );
}
