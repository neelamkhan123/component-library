"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "neelam-ui";

/**
 * The tab strip is the library's own Tabs component — the docs run on the
 * thing they document. It has to live in a client file because nothing in
 * `neelam-ui` carries a "use client" directive of its own.
 */
export function PreviewTabs({
  preview,
  code,
}: {
  preview: ReactNode;
  code: ReactNode;
}) {
  return (
    <Tabs defaultValue="preview" className="my-6 w-full">
      <TabsList className="w-fit">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">{preview}</TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  );
}
