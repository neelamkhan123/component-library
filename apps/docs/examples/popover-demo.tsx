"use client";

import {
  buttonVariants,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "neelam-ui";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger className={buttonVariants({ variant: "outline" })}>
        Dimensions
      </PopoverTrigger>
      {/* Named by the trigger's own text automatically — no aria-label needed. */}
      <PopoverContent className="w-72">
        <p className="text-sm font-medium text-slate-950 dark:text-white">
          Dimensions
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Set the layer size in pixels.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <label className="grid grid-cols-[4rem_1fr] items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            Width
            <Input size="sm" defaultValue="480" />
          </label>
          <label className="grid grid-cols-[4rem_1fr] items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            Height
            <Input size="sm" defaultValue="320" />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
