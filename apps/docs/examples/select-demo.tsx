"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "neelam-ui";

export default function SelectDemo() {
  return (
    <label className="flex w-64 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Timezone
      <Select defaultValue="utc">
        <SelectTrigger>
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="utc">UTC</SelectItem>
          <SelectItem value="est">Eastern (EST)</SelectItem>
          <SelectItem value="pst">Pacific (PST)</SelectItem>
          <SelectItem value="cet">Central European (CET)</SelectItem>
        </SelectContent>
      </Select>
    </label>
  );
}
