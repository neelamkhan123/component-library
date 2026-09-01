"use client";

import {
  buttonVariants,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
} from "neelam-ui";

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
        Open filters
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow the results without leaving the page.
          </DrawerDescription>
        </DrawerHeader>
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
            Keyword
            <Input placeholder="Search…" />
          </label>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
