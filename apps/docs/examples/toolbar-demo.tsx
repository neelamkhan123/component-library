"use client";

import { MessageCircle, Plus, Settings, Share2 } from "lucide-react";
import { Separator, Toolbar, ToolbarButton } from "neelam-ui";

export default function ToolbarDemo() {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
      {/* `className="absolute"` overrides the component's own `fixed` here so
          the demo stays inside this preview card instead of docking to the
          real page edge — in an actual app, Toolbar is rendered once near
          your root and floats relative to the viewport with no wrapper
          needed. */}
      <Toolbar label="Quick actions" className="absolute">
        <ToolbarButton icon={<Plus />} label="New" />
        <ToolbarButton icon={<MessageCircle />} label="Comments" />
        <Separator className="mx-0.5" />
        <ToolbarButton icon={<Share2 />} label="Share" />
        <ToolbarButton icon={<Settings />} label="Settings" />
      </Toolbar>
    </div>
  );
}
