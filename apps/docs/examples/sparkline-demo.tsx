"use client";

import { Sparkline } from "neelam-ui";

const visits = [12, 15, 14, 19, 22, 20, 27, 25, 31, 34, 33, 39];

export default function SparklineDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Decorative by default — the number beside it carries the meaning. */}
      <p className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
        Visits <span className="font-semibold">39K</span>
        <Sparkline data={visits} className="h-6 w-24 text-emerald-600 dark:text-emerald-400" />
      </p>

      <Sparkline
        data={visits}
        showEndPoint
        className="h-10 w-40 text-slate-950 dark:text-white"
        label="Visits trending up over the last twelve months"
      />
    </div>
  );
}
