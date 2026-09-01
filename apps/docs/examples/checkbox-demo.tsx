"use client";

import { Checkbox } from "neelam-ui";

export default function CheckboxDemo() {
  return (
    <label className="flex items-center gap-2.5 text-sm text-slate-950 dark:text-white">
      <Checkbox defaultChecked />
      Email me about product updates
    </label>
  );
}
