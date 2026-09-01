"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@neelamkhan21/ui";
import type { ReactNode } from "react";

const managers = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof managers)[number];

/** Server-rendered highlighted blocks, one per manager, keyed by name. */
export function InstallTabs({ blocks }: { blocks: Record<PackageManager, ReactNode> }) {
  return (
    <Tabs defaultValue="npm" className="my-6 w-full">
      <TabsList className="w-fit">
        {managers.map((manager) => (
          <TabsTrigger key={manager} value={manager}>
            {manager}
          </TabsTrigger>
        ))}
      </TabsList>
      {managers.map((manager) => (
        <TabsContent key={manager} value={manager}>
          {blocks[manager]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
