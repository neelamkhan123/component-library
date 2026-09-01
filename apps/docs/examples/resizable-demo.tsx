"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "neelam-ui";

export default function ResizableDemo() {
  return (
    <ResizablePanelGroup className="h-64 rounded-xl border border-slate-200 dark:border-slate-800">
      <ResizablePanel defaultSize={30} minSize={15} className="p-4">
        <p className="text-sm font-medium text-slate-950 dark:text-white">
          Sidebar
        </p>
      </ResizablePanel>
      {/* Focus the handle and use the arrow keys — dragging is not the only way. */}
      <ResizableHandle withHandle />
      <ResizablePanel className="p-4">
        <p className="text-sm font-medium text-slate-950 dark:text-white">
          Content
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Drag the divider, or focus it and press ← / →.
        </p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
