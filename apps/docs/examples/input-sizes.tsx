"use client";

import { Input } from "neelam-ui";

export default function InputSizes() {
  return (
    <div className="flex w-72 flex-col gap-4">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  );
}
