"use client";

import { useState } from "react";
import { Calendar } from "neelam-ui";

export default function CalendarDemo() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar selected={selected} onSelect={setSelected} />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {selected ? selected.toDateString() : "No date selected"}
      </p>
    </div>
  );
}
