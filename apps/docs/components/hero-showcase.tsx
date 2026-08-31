"use client";

import { useState } from "react";
import { Bell, CreditCard, TrendingUp } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTriggerIcon,
  Progress,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  Toaster,
} from "@neelamkhan21/ui";

const regions = ["Europe", "North America", "South America", "Asia Pacific"];

/**
 * The hero is built out of the library itself rather than a screenshot, so
 * it is always in sync with the published package — and it is fully
 * keyboard operable, which is rather the point.
 */
export function HeroShowcase() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="sm:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Workspace settings</CardTitle>
              <CardDescription>Manage how your team is billed and notified.</CardDescription>
            </div>
            <Badge variant="secondary">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-2">
              <label className="flex w-full flex-col gap-1.5 text-sm font-medium">
                Primary region
                <Combobox defaultValue="europe">
                  <div className="relative">
                    <ComboboxInput placeholder="Search regions…" className="pr-8" />
                    <ComboboxTriggerIcon className="absolute top-1/2 right-3 -translate-y-1/2" />
                  </div>
                  <ComboboxContent>
                    {regions.map((region) => (
                      <ComboboxItem key={region} value={region.toLowerCase()}>
                        {region}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>No regions found.</ComboboxEmpty>
                  </ComboboxContent>
                </Combobox>
              </label>

              <label className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Bell className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Email notifications
                </span>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </label>
            </TabsContent>

            <TabsContent value="billing" className="space-y-3 pt-2 text-sm">
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />
                Visa ending in 4242 · renews 1 Oct
              </p>
              <div className="flex -space-x-2">
                {["AL", "GH", "AT", "KJ"].map((initials) => (
                  <Avatar key={initials} size="sm" className="ring-2 ring-white dark:ring-slate-950">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <TrendingUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Seats used
                </span>
                <span className="text-slate-500 dark:text-slate-400">18 / 25</span>
              </div>
              <Progress value={72} aria-label="Seats used" className="w-full" />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => toast({ title: "Settings saved", variant: "success" })}>
            Save changes
          </Button>
        </CardFooter>
      </Card>
      <Toaster position="bottom-right" />
    </div>
  );
}
