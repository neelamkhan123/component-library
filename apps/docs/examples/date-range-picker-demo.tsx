"use client";

import { useState } from "react";
import { DateRangePicker, type DateRange } from "neelam-ui";

export default function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="flex flex-col items-center gap-3">
      <DateRangePicker
        value={range}
        onValueChange={setRange}
        placeholder="Pick a date range"
        // The future is not a valid reporting period.
        disabled={(date) => date > new Date()}
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {range?.from && range?.to
          ? `${range.from.toDateString()} — ${range.to.toDateString()}`
          : "No range selected"}
      </p>
    </div>
  );
}
