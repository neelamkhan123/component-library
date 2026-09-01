"use client";

import { AspectRatio } from "neelam-ui";

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={16 / 9} className="rounded-xl bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          16 / 9
        </div>
      </AspectRatio>
    </div>
  );
}
