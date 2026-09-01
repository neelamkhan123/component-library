"use client";

import { Switch } from "neelam-ui";

export default function SwitchDemo() {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-950 dark:text-white">
      <Switch defaultChecked />
      Enable notifications
    </label>
  );
}
