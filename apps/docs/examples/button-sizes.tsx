"use client";

import { Plus } from "lucide-react";
import { Button } from "@neelamkhan21/ui";

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add item">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
