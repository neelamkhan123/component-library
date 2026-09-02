"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, normalizePath } from "@/lib/utils";

const links = [
  {
    href: "/docs",
    label: "Docs",
    match: (p: string) =>
      p === "/docs" ||
      (p.startsWith("/docs") && !p.startsWith("/docs/components")),
  },
  {
    href: "/docs/components/button",
    label: "Components",
    match: (p: string) => p.startsWith("/docs/components"),
  },
  {
    href: "/blocks",
    label: "Blocks",
    match: (p: string) => p.startsWith("/blocks"),
  },
];

export function MainNavLinks() {
  const pathname = normalizePath(usePathname());

  return (
    <nav
      aria-label="Main"
      className="hidden items-center gap-5 pl-6 text-sm lg:flex"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.match(pathname) ? "page" : undefined}
          className={cn(
            "transition-colors hover:text-slate-950 dark:hover:text-white",
            link.match(pathname)
              ? "font-medium text-slate-950 dark:text-white"
              : "text-slate-600 dark:text-slate-400",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
