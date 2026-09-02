"use client";

import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Download,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  Chart,
  ChartDataTable,
  ChartLegend,
  ChartLegendItem,
  DataTable,
  type DataTableColumn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

const revenue = [
  { month: "Jan", revenue: 42_000, forecast: 40_000 },
  { month: "Feb", revenue: 46_500, forecast: 44_000 },
  { month: "Mar", revenue: 44_200, forecast: 47_000 },
  { month: "Apr", revenue: 52_800, forecast: 50_000 },
  { month: "May", revenue: 58_100, forecast: 54_000 },
  { month: "Jun", revenue: 61_400, forecast: 58_000 },
];

interface Deal {
  id: string;
  company: string;
  owner: string;
  stage: "Won" | "Negotiating" | "Qualifying";
  value: number;
  closing: string;
}

const deals: Deal[] = [
  { id: "d1", company: "Northwind Traders", owner: "Ada Lovelace", stage: "Won", value: 24_000, closing: "2 Jun" },
  { id: "d2", company: "Contoso", owner: "Grace Hopper", stage: "Negotiating", value: 18_500, closing: "4 Jun" },
  { id: "d3", company: "Fabrikam", owner: "Alan Turing", stage: "Qualifying", value: 9_200, closing: "7 Jun" },
  { id: "d4", company: "Tailspin Toys", owner: "Katherine Johnson", stage: "Won", value: 31_750, closing: "9 Jun" },
  { id: "d5", company: "Adventure Works", owner: "Margaret Hamilton", stage: "Negotiating", value: 12_400, closing: "11 Jun" },
  { id: "d6", company: "Proseware", owner: "Radia Perlman", stage: "Qualifying", value: 6_800, closing: "14 Jun" },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const stageVariant = {
  Won: "default",
  Negotiating: "secondary",
  Qualifying: "outline",
} as const;

const columns: DataTableColumn<Deal>[] = [
  { key: "company", header: "Company", sortable: true },
  { key: "owner", header: "Owner", sortable: true },
  {
    key: "stage",
    header: "Stage",
    sortable: true,
    cell: (row) => <Badge variant={stageVariant[row.stage]}>{row.stage}</Badge>,
    // The cell renders a Badge, so the raw string has to be given separately
    // for the filter box to match against it.
    filterValue: (row) => row.stage,
  },
  {
    key: "value",
    header: "Value",
    sortable: true,
    align: "right",
    cell: (row) => money.format(row.value),
  },
  { key: "closing", header: "Closing", align: "right" },
];

export default function Dashboard01() {
  return (
    <SidebarProvider className="h-full min-h-[40rem] w-full overflow-hidden">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
              N
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                Northstar
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                Revenue team
              </span>
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Analyse</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" isActive icon={<LayoutDashboard />}>
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<BarChart3 />}>
                  Reports
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" icon={<CreditCard />}>
                  {/* The count sits inside the link so it reads as part of the label. */}
                  <span className="flex-1">Invoices</span>
                  <Badge variant="secondary">7</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
                ada@northstar.io
              </span>
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The trigger lives in the page header, not in the panel — inside, it
            would disappear along with the sidebar it is meant to bring back. */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <SidebarTrigger />
          <h1 className="text-sm font-medium text-slate-950 dark:text-white">
            Overview
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({ size: "sm" })}
              >
                New deal
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Create</DropdownMenuLabel>
                <DropdownMenuItem>Blank deal</DropdownMenuItem>
                <DropdownMenuItem>From a template</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Import from CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
          <section aria-labelledby="dashboard-kpis">
            {/* The numbers speak for themselves on screen; the heading is
                there so the region has a name in the page outline. */}
            <h2 id="dashboard-kpis" className="sr-only">
              Key metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Revenue"
                value="$61.4K"
                delta={0.058}
                deltaLabel="vs. May"
                trend={[42, 46, 44, 48, 52, 55, 58, 61]}
              />
              <StatCard
                label="New customers"
                value="248"
                delta={0.121}
                deltaLabel="vs. May"
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                label="Open pipeline"
                value="$102.6K"
                delta={-0.024}
                deltaLabel="vs. May"
              />
              {/* Churn going up is bad news, so the colour has to flip. */}
              <StatCard
                label="Churn"
                value="1.8%"
                delta={-0.006}
                deltaLabel="vs. May"
                deltaDirection="down-is-good"
              />
            </div>
          </section>

          <Chart
            title="Revenue against forecast"
            description="Revenue has run ahead of forecast every month since April."
            height={240}
            legend={
              <ChartLegend>
                <ChartLegendItem color="var(--chart-1)">Revenue</ChartLegendItem>
                <ChartLegendItem color="var(--chart-2)">Forecast</ChartLegendItem>
              </ChartLegend>
            }
            // The plot is aria-hidden, so this table is the accessible equivalent.
            dataTable={
              <ChartDataTable
                caption="Revenue and forecast by month"
                columns={[
                  { header: "Month", cell: (row) => row.month },
                  { header: "Revenue", cell: (row) => money.format(row.revenue) },
                  { header: "Forecast", cell: (row) => money.format(row.forecast) },
                ]}
                data={revenue}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value: number) => `${value / 1000}K`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#revenue-fill)"
                />
                {/* Forecast is the reference line, so it reads as an outline
                    rather than a second filled band competing with actuals. */}
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Chart>

          <section aria-labelledby="dashboard-deals" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="dashboard-deals"
                className="text-sm font-semibold text-slate-950 dark:text-white"
              >
                Deals closing this month
              </h2>
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-md text-sm text-slate-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:text-slate-400 dark:focus-visible:ring-white"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
            <DataTable
              columns={columns}
              data={deals}
              getRowId={(row) => row.id}
              pageSize={5}
              filterable
              filterPlaceholder="Filter deals…"
            />
          </section>
        </main>
      </div>
    </SidebarProvider>
  );
}
