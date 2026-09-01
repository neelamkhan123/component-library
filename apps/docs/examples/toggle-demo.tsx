"use client";

import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "neelam-ui";

export default function ToggleDemo() {
  return (
    <div className="flex items-center gap-1">
      {/* Icon-only, so each needs an explicit name — nothing else labels it. */}
      <Toggle size="icon" variant="outline" aria-label="Bold" defaultPressed>
        <Bold className="h-4 w-4" aria-hidden="true" />
      </Toggle>
      <Toggle size="icon" variant="outline" aria-label="Italic">
        <Italic className="h-4 w-4" aria-hidden="true" />
      </Toggle>
      <Toggle size="icon" variant="outline" aria-label="Underline">
        <Underline className="h-4 w-4" aria-hidden="true" />
      </Toggle>
    </div>
  );
}
