import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A set of panels, one shown at a time, switched between via a strip of tabs. Compose it with `TabsList`, `TabsTrigger`, and `TabsContent`. Arrow keys move focus and switch tabs together ("automatic activation"). `orientation` accepts `"horizontal"` (the default) or `"vertical"`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-80">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-sm text-slate-600 dark:text-slate-300">
        Update your name and email address.
      </TabsContent>
      <TabsContent value="password" className="text-sm text-slate-600 dark:text-slate-300">
        Change your password or enable two-factor authentication.
      </TabsContent>
      <TabsContent value="team" className="text-sm text-slate-600 dark:text-slate-300">
        Invite teammates and manage their roles.
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-slate-600 dark:text-slate-300">
        A summary of recent activity.
      </TabsContent>
      <TabsContent value="analytics" className="text-sm text-slate-600 dark:text-slate-300">
        Traffic and usage over time.
      </TabsContent>
      <TabsContent value="billing" className="text-sm text-slate-600 dark:text-slate-300">
        Billing is unavailable on this plan.
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="w-96">
      <TabsList className="w-40">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="text-sm text-slate-600 dark:text-slate-300">
        Language, timezone, and display preferences.
      </TabsContent>
      <TabsContent value="notifications" className="text-sm text-slate-600 dark:text-slate-300">
        Choose what you get notified about.
      </TabsContent>
      <TabsContent value="privacy" className="text-sm text-slate-600 dark:text-slate-300">
        Control who can see your profile.
      </TabsContent>
    </Tabs>
  ),
};
