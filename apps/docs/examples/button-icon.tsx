"use client";

import { Download, Trash2 } from "lucide-react";
import { Button } from "neelam-ui";

export default function ButtonIcon() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button icon={<Download className="h-4 w-4" />}>Download</Button>
      <Button variant="destructive" icon={<Trash2 className="h-4 w-4" />}>
        Delete
      </Button>
    </div>
  );
}
