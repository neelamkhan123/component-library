"use client";

import { FolderPlus } from "lucide-react";
import { Button, EmptyState } from "neelam-ui";

export default function EmptyStateDemo() {
  return (
    <EmptyState
      className="w-full max-w-md"
      icon={<FolderPlus className="h-5 w-5" />}
      title="No projects yet"
      description="Create your first project to start deploying. It takes about a minute."
      action={<Button>New project</Button>}
    />
  );
}
