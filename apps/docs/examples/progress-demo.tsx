"use client";

import { Progress } from "neelam-ui";

export default function ProgressDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-slate-700 dark:text-slate-300">
          Uploading — 62%
        </span>
        <Progress value={62} aria-label="Upload progress" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-slate-700 dark:text-slate-300">
          Indeterminate
        </span>
        {/* No value — the bar pulses instead of filling. */}
        <Progress aria-label="Loading" />
      </div>
    </div>
  );
}
