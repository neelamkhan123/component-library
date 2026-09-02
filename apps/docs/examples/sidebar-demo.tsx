"use client";

import { FileText, Home, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "neelam-ui";

export default function SidebarDemo() {
  return (
    <SidebarProvider className="h-72 min-h-0 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <Sidebar className="border-r border-slate-200 dark:border-slate-800">
        <SidebarHeader className="flex items-center">
          <span className="text-sm font-semibold text-slate-950 dark:text-white">
            Header
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="#"
                  isActive
                  icon={<Home className="h-4 w-4" aria-hidden="true" />}
                >
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="#"
                  icon={<FileText className="h-4 w-4" aria-hidden="true" />}
                >
                  Documents
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="#"
                  icon={<Settings className="h-4 w-4" aria-hidden="true" />}
                >
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 p-4">
        <SidebarTrigger />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Toggle the sidebar with the button above.
        </p>
      </main>
    </SidebarProvider>
  );
}
