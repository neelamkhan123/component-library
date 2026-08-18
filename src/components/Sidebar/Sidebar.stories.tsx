import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Home, Inbox, Search, Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../Avatar/Avatar";
import {
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
} from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A docked, collapsible-width navigation panel. Wrap `Sidebar` and your page\'s main content in `SidebarProvider`, and toggle it with `SidebarTrigger` (placed in your own page header, not inside `Sidebar` itself — see the "Default" story: a trigger inside the panel would become unreachable the moment it collapses).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
      <SidebarTrigger />
      <h1 className="text-sm font-medium text-slate-950 dark:text-white">{title}</h1>
    </div>
  );
}

function PlaceholderBody() {
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-slate-400 dark:text-slate-600">
      Page content
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold text-slate-950 dark:text-white">Acme Inc</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Home />} isActive>
                  Home
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
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
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
          <div className="flex items-center gap-2 px-1">
            <Avatar size="sm">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-700 dark:text-slate-300">Jane Doe</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-1 flex-col">
        <TopBar title="Dashboard" />
        <PlaceholderBody />
      </main>
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  name: "Docked to the right",
  render: () => (
    <SidebarProvider>
      <main className="flex flex-1 flex-col">
        <TopBar title="Dashboard" />
        <PlaceholderBody />
      </main>
      <Sidebar side="right">
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold text-slate-950 dark:text-white">Notes</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Home />} isActive>
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};

export const InitiallyCollapsed: Story = {
  name: "Initially collapsed",
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar>
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold text-slate-950 dark:text-white">Acme Inc</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<Home />} isActive>
                  Home
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex flex-1 flex-col">
        <TopBar title="Dashboard" />
        <PlaceholderBody />
      </main>
    </SidebarProvider>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar>
          <SidebarHeader>
            <span className="px-2 text-sm font-semibold text-slate-950 dark:text-white">Acme Inc</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton href="#" icon={<Home />} isActive>
                    Home
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex flex-1 flex-col">
          <TopBar title="Dashboard" />
          <p className="p-3 text-xs text-slate-500 dark:text-slate-400">
            Sidebar is {open ? "open" : "collapsed"} (state lives outside the component).
          </p>
        </main>
      </SidebarProvider>
    );
  },
};
