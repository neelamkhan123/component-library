"use client";

import { Input } from "neelam-ui";

export default function InputDemo() {
  return (
    <label className="flex w-72 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Email
      <Input type="email" placeholder="ada@example.com" />
    </label>
  );
}
