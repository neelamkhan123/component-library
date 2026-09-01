"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "neelam-ui";
import { sidebarNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform ?? ""));
  }, []);

  // The library deliberately ships no global Cmd+K listener — that decision
  // is documented in its DECISIONS.md — so the shortcut is wired up here,
  // where the app can see what else is competing for the keystroke.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isTyping) return;
      event.preventDefault();
      setOpen((previous) => !previous);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:h-9 sm:w-56 sm:justify-start sm:gap-2 sm:px-3 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
        )}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden text-sm sm:inline">Search docs…</span>
        <span className="sr-only sm:hidden">Search documentation</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-slate-200 px-1.5 font-mono text-[10px] text-slate-500 sm:inline-flex dark:border-slate-700 dark:text-slate-400">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
      >
        <CommandInput placeholder="Search components and guides…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarNav.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => go(item.href)}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
