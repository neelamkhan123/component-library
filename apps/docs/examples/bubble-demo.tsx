"use client";

import { Bubble } from "neelam-ui";

export default function BubbleDemo() {
  return (
    // A plain flex column of Bubbles already reads as a conversation —
    // outgoing bubbles push themselves right on their own.
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Bubble>Hey — did the deploy finish?</Bubble>
      <Bubble variant="outgoing">Just went green a minute ago.</Bubble>
      <Bubble>Perfect, thanks.</Bubble>
    </div>
  );
}
