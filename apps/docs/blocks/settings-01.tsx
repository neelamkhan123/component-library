"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
  Toaster,
} from "neelam-ui";

const notifications = [
  {
    id: "mentions",
    title: "Mentions",
    hint: "Someone @-mentions you in a comment or a document.",
    defaultOn: true,
  },
  {
    id: "reviews",
    title: "Review requests",
    hint: "You are added as a reviewer on a pull request.",
    defaultOn: true,
  },
  {
    id: "digest",
    title: "Weekly digest",
    hint: "A Monday summary of everything that moved last week.",
    defaultOn: false,
  },
  {
    id: "marketing",
    title: "Product news",
    hint: "Occasional announcements about new features.",
    defaultOn: false,
  },
];

const plans = [
  { value: "starter", label: "Starter", price: "$0", hint: "Up to 3 projects and one seat." },
  { value: "pro", label: "Pro", price: "$24", hint: "Unlimited projects, 10 seats, priority support." },
  { value: "team", label: "Team", price: "$96", hint: "SSO, audit log, and a dedicated environment." },
];

export default function Settings01() {
  const [saving, setSaving] = useState(false);

  // Stands in for the request a real page would make. The loading state is
  // the point: `Button` disables itself while `loading`, so the form cannot
  // be submitted twice.
  function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Settings saved", variant: "success" });
    }, 900);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your profile, how you are notified, and what you are billed.
          </p>
        </div>
        <Badge variant="secondary">Pro plan</Badge>
      </header>

      <Separator className="my-6" />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form className="flex flex-col gap-6 pt-2" onSubmit={save}>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src="https://i.pravatar.cc/128?img=47" alt="" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline">
                    Change photo
                  </Button>
                  <Button type="button" size="sm" variant="ghost">
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PNG or JPG, up to 2 MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                Full name
                <Input defaultValue="Ada Lovelace" autoComplete="name" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                Email
                <Input
                  type="email"
                  defaultValue="ada@northstar.io"
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
              Bio
              <Textarea
                rows={3}
                defaultValue="Working on analytical engines and the notation for them."
              />
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Shown on your public profile. Markdown is supported.
              </span>
            </label>

            <label className="flex max-w-xs flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
              Timezone
              <Select defaultValue="gmt">
                <SelectTrigger>
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmt">London (GMT)</SelectItem>
                  <SelectItem value="cet">Berlin (CET)</SelectItem>
                  <SelectItem value="est">New York (EST)</SelectItem>
                  <SelectItem value="pst">San Francisco (PST)</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="flex flex-col gap-1 pt-2">
            {notifications.map((item) => (
              // The label wraps the Switch, so the whole row is its hit area
              // and no aria-label is needed.
              <label
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-lg px-2 py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-slate-950 dark:text-white">
                    {item.title}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {item.hint}
                  </span>
                </span>
                <Switch defaultChecked={item.defaultOn} className="mt-0.5 shrink-0" />
              </label>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="flex flex-col gap-8 pt-2">
            <section>
              {/* role="radiogroup" carries no name of its own, so the visible
                  heading is the natural thing to point it at. */}
              <h2
                id="plan-heading"
                className="text-sm font-semibold text-slate-950 dark:text-white"
              >
                Plan
              </h2>
              <RadioGroup
                defaultValue="pro"
                aria-labelledby="plan-heading"
                className="mt-3 gap-3"
              >
                {plans.map((plan) => (
                  <label
                    key={plan.value}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 has-checked:border-slate-950 dark:border-slate-800 dark:has-checked:border-white"
                  >
                    <RadioGroupItem value={plan.value} className="mt-0.5" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-baseline justify-between gap-2 text-sm font-medium text-slate-950 dark:text-white">
                        {plan.label}
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                          {plan.price}/month
                        </span>
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {plan.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                Payment method
              </h2>
              <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <span className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Visa ending 4242 · renews 1 October
                </span>
                <Button size="sm" variant="outline">
                  Update
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">
                Danger zone
              </h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 p-4 dark:border-red-900">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Deleting the workspace removes every project and cannot be
                  undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger
                    className={buttonVariants({ variant: "destructive", size: "sm" })}
                  >
                    Delete workspace
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes Northstar, its 12 projects, and
                        every deployment attached to them.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive">
                        Delete workspace
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {/* In a real app this lives once, near the root of the tree. */}
      <Toaster position="bottom-right" />
    </div>
  );
}
