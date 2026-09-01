"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "neelam-ui";

const sides = ["top", "right", "bottom", "left"] as const;

export default function TooltipSides() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {sides.map((side) => (
        <Tooltip key={side} side={side}>
          <TooltipTrigger className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-950 dark:border-slate-700 dark:text-white">
            {side}
          </TooltipTrigger>
          <TooltipContent>Shown on the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
