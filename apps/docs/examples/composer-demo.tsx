"use client";

import { useState } from "react";
import { Bubble, Composer } from "neelam-ui";

export default function ComposerDemo() {
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {sent.map((message, index) => (
        <Bubble key={index} variant="outgoing">
          {message}
        </Bubble>
      ))}
      {/* Uncontrolled, so the field clears itself after each send. */}
      <Composer
        aria-label="Message"
        placeholder="Message… (Enter to send, Shift+Enter for a newline)"
        onSubmit={(value) => setSent((current) => [...current, value])}
      />
    </div>
  );
}
