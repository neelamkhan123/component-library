"use client";

import { Textarea } from "neelam-ui";

export default function TextareaDemo() {
  return (
    <label className="flex w-80 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Feedback
      <Textarea placeholder="Tell us what you think…" />
    </label>
  );
}
