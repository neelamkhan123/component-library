"use client";

import {
  buttonVariants,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "neelam-ui";

const sides = ["top", "right", "bottom", "left"] as const;

export default function DrawerSides() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sides.map((side) => (
        <Drawer key={side}>
          <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
            {side}
          </DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>Slides in from the {side}</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
