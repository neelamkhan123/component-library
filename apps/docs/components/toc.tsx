"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

export function TableOfContents() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Reading headings out of the DOM rather than threading them through MDX
  // means this works identically for hand-written .tsx pages and .mdx ones,
  // and can never fall out of sync with what actually rendered.
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("main h2[id], main h3[id]"),
    );
    setHeadings(
      nodes.map((node) => ({
        id: node.id,
        text: node.textContent?.replace(/#$/, "").trim() ?? "",
        level: Number(node.tagName[1]),
      })),
    );
    setActiveId(nodes[0]?.id ?? "");
  }, [pathname]);

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // A band just below the sticky header: a heading counts as "current"
      // once it reaches the top of the viewport, not when it first appears.
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <div className="sticky top-header hidden h-[calc(100dvh-var(--spacing-header))] w-56 shrink-0 overflow-y-auto py-8 pl-6 xl:block">
      <nav aria-label="On this page">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          On this page
        </p>
        <ul className="space-y-1.5 text-sm">
          {headings.map((heading) => (
            <li key={heading.id} className={heading.level === 3 ? "pl-3" : undefined}>
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={cn(
                  "block rounded transition-colors hover:text-slate-950 dark:hover:text-white",
                  activeId === heading.id
                    ? "font-medium text-accent-600 dark:text-accent-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
