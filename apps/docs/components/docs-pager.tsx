"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { flatNav } from "@/lib/nav";
import { normalizePath } from "@/lib/utils";

export function DocsPager() {
  const pathname = normalizePath(usePathname());
  const index = flatNav.findIndex((item) => item.href === pathname);
  if (index === -1) return null;

  const previous = flatNav[index - 1];
  const next = flatNav[index + 1];
  if (!previous && !next) return null;

  const linkClass =
    "group flex flex-1 items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:bg-slate-900";

  return (
    <nav aria-label="Documentation pages" className="mt-16 flex flex-col gap-3 sm:flex-row">
      {previous ? (
        <Link href={previous.href} className={linkClass}>
          <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-xs text-slate-500 dark:text-slate-400">Previous</span>
            <span className="block truncate font-medium">{previous.title}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      {next ? (
        <Link href={next.href} className={`${linkClass} text-right`}>
          <span className="ml-auto min-w-0">
            <span className="block text-xs text-slate-500 dark:text-slate-400">Next</span>
            <span className="block truncate font-medium">{next.title}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
    </nav>
  );
}
