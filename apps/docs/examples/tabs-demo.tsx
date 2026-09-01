"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "neelam-ui";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Update your display name and the email you sign in with.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Change your password. You will be signed out of other devices.
        </p>
      </TabsContent>
      <TabsContent value="team">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Invite teammates and manage their roles.
        </p>
      </TabsContent>
    </Tabs>
  );
}
