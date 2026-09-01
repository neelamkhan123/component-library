"use client";

import { Separator } from "neelam-ui";

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm">
      <div>
        <h4 className="text-sm font-medium text-slate-950 dark:text-white">
          neelam-ui
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          An accessible React component library.
        </p>
      </div>

      <Separator className="my-4" />

      {/* A vertical separator stretches to its flex row's height. */}
      <div className="flex h-5 items-center gap-4 text-sm text-slate-700 dark:text-slate-300">
        Docs
        <Separator orientation="vertical" />
        Source
        <Separator orientation="vertical" />
        Changelog
      </div>
    </div>
  );
}
