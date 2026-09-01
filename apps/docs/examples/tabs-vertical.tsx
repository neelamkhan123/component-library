"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "neelam-ui";

export default function TabsVertical() {
  return (
    // Up/Down replace Left/Right when the strip is vertical, and
    // aria-orientation is set to match.
    <Tabs defaultValue="general" orientation="vertical" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Workspace name, language, and timezone.
        </p>
      </TabsContent>
      <TabsContent value="appearance">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Theme and density.
        </p>
      </TabsContent>
      <TabsContent value="advanced">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Experimental features and data export.
        </p>
      </TabsContent>
    </Tabs>
  );
}
