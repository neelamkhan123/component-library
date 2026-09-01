"use client";

import { Bubble, TypingIndicator } from "neelam-ui";

export default function TypingIndicatorDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Bubble variant="outgoing">Can you summarise the release notes?</Bubble>
      {/* Sits exactly where the incoming Bubble will land. */}
      <TypingIndicator label="Assistant is typing…" />
    </div>
  );
}
