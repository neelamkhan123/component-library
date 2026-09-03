"use client";

import { Bold, Highlighter, Italic, Underline } from "lucide-react";
import { Separator, Toolbar, ToolbarButton } from "neelam-ui";

export default function ToolbarOrientation() {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
      {/* `side="top"` switches Toolbar to a horizontal rail on its own —
          orientation follows the docked edge, not a separate prop. */}
      <Toolbar label="Formatting" side="top" className="absolute">
        <ToolbarButton icon={<Bold />} label="Bold" />
        <ToolbarButton icon={<Italic />} label="Italic" />
        <ToolbarButton icon={<Underline />} label="Underline" />
        <Separator orientation="vertical" className="my-0.5" />
        <ToolbarButton icon={<Highlighter />} label="Highlight" />
      </Toolbar>
    </div>
  );
}
