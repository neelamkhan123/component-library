"use client";

import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  LifeBuoy,
  Settings,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
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
  StatCard,
} from "neelam-ui";

const activity = [
  {
    id: 1,
    who: "Grace Hopper",
    what: "merged “Billing rewrite”",
    when: "12m ago",
  },
  { id: 2, who: "Alan Turing", what: "commented on INV-204", when: "1h ago" },
  { id: 3, who: "Ada Lovelace", what: "invited 3 teammates", when: "3h ago" },
];

export default function SidebarDemo() {
  return (
    <SidebarProvider className="h-[30rem] min-h-0 w-full overflow-hidden rounded-xl">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
              A
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                Acme Inc
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                Pro plan
              </span>
            </span>
          </div>
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
                <SidebarMenuButton href="#" icon={<FileText />}>
                  {/* The count sits inside the link so it reads as part of the label. */}
                  <span className="flex-1">Documents</span>
                  <Badge variant="secondary">12</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<BarChart3 />}>
                  Reports
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<CreditCard />}>
                  Billing
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
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<LifeBuoy />}>
                  Support
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 px-1">
            <Avatar size="sm">
              {/* The name is visible right beside it, so the image is decorative. */}
              <AvatarImage src="https://i.pravatar.cc/128?img=47" alt="" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-slate-950 dark:text-white">
                Ada Lovelace
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                ada@acme.com
              </span>
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex min-w-0 flex-1 flex-col">
        {/* The trigger lives in the page header, not in the panel — inside, it
            would disappear along with the sidebar it is meant to bring back. */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
          <SidebarTrigger />
          <h1 className="text-sm font-medium text-slate-950 dark:text-white">
            Overview
          </h1>
          <Button size="sm" variant="outline" className="ml-auto">
            Invite
          </Button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* No deltaLabel here: side by side in a half-width pane, the
                sparkline leaves the delta row too little room for one. */}
            <StatCard
              label="Active users"
              value="12.9K"
              delta={0.124}
              trend={[180, 190, 210, 205, 240, 260, 255, 290, 310, 340]}
            />
            <StatCard
              label="Open invoices"
              value="$18.2K"
              delta={-0.043}
              deltaLabel="vs. last month"
              deltaDirection="down-is-good"
            />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recent activity
            </h2>
            <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-baseline gap-2 py-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className="font-medium text-slate-950 dark:text-white">
                    {item.who}
                  </span>
                  <span className="truncate">{item.what}</span>
                  <span className="ml-auto shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {item.when}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </SidebarProvider>
  );
}
