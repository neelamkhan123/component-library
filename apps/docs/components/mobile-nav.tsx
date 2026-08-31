"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@neelamkhan21/ui";
import { sidebarNav } from "@/lib/nav";
import { cn, normalizePath } from "@/lib/utils";

export function MobileNav() {
  const pathname = normalizePath(usePathname());
  const [open, setOpen] = useState(false);

  // Navigating is what should dismiss the drawer; leaving it open over the
  // newly-rendered page is the classic mobile-nav bug.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <DrawerContent side="left" className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Documentation</DrawerTitle>
        </DrawerHeader>
        <nav aria-label="Documentation" className="mt-4 pb-10">
          {sidebarNav.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-slate-100 font-medium text-slate-950 dark:bg-slate-800 dark:text-white"
                          : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
