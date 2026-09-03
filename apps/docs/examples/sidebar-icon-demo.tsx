"use client";

import { useState } from "react";
import { Home, Inbox, Search, Settings, Users } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "neelam-ui";

// `SidebarHeader`/`SidebarFooter` content isn't restyled for you — unlike a
// menu button's icon+label shape, header/footer content has no single common
// shape this component could adapt on its own, so it's read from the same
// `useSidebar()` a custom trigger would use.
function WorkspaceHeader() {
  const { open } = useSidebar();
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
        A
      </span>
      {open ? (
        <span className="truncate text-sm font-semibold text-slate-950 dark:text-white">
          Acme Inc
        </span>
      ) : null}
    </div>
  );
}

function AccountFooter() {
  const { open } = useSidebar();
  return (
    <div className="flex items-center gap-2 px-1">
      <Avatar size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      {open ? (
        <span className="truncate text-sm text-slate-700 dark:text-slate-300">
          Jane Doe
        </span>
      ) : null}
    </div>
  );
}

export default function SidebarIconDemo() {
  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      className="h-[26rem] min-h-0 w-full overflow-hidden rounded-xl"
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <WorkspaceHeader />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" isActive icon={<Home />}>
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Inbox />}>
                  Inbox
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Search />}>
                  Search
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Users />}>
                  Team
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Settings />}>
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <AccountFooter />
        </SidebarFooter>
      </Sidebar>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
          <SidebarTrigger />
          <h1 className="text-sm font-medium text-slate-950 dark:text-white">
            Overview
          </h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-slate-500 dark:text-slate-400">
          Collapse the sidebar — it becomes an icon rail, not a hidden panel.
          Hover a link to see its label again.
        </div>
      </main>
    </SidebarProvider>
  );
}
