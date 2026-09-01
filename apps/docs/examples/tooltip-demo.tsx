"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "neelam-ui";

export default function TooltipDemo() {
  return (
    <p className="max-w-sm text-center text-sm text-slate-700 dark:text-slate-300">
      Your plan includes 500 build minutes{" "}
      <Tooltip>
        <TooltipTrigger className="text-slate-950 underline decoration-dotted underline-offset-4 dark:text-white">
          per cycle
          <Info className="ml-1 inline h-3.5 w-3.5 align-[-0.15em]" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Resets on the 1st of each month.</TooltipContent>
      </Tooltip>
      .
    </p>
  );
}
