"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNav } from "@/lib/nav";
import { cn, normalizePath } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = normalizePath(usePathname());

  return (
    <aside className="sticky top-header hidden h-[calc(100dvh-var(--spacing-header))] w-sidebar shrink-0 overflow-y-auto border-r border-slate-200 py-8 pr-4 lg:block dark:border-slate-800">
      <nav aria-label="Documentation">
        {sidebarNav.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {group.title}
            </h2>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-slate-100 font-medium text-slate-950 dark:bg-slate-800 dark:text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      )}
                    >
                      {item.title}
                      {item.draft ? (
                        <span
                          title="Documentation in progress"
                          className="shrink-0 rounded-full border border-slate-200 px-1.5 py-px text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400"
                        >
                          WIP
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
