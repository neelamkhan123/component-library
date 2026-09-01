import Link from "next/link";
import { GitHubIcon, NpmIcon } from "@/components/icons";
import { CommandMenu } from "@/components/command-menu";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { MainNavLinks } from "@/components/main-nav-links";
import { siteConfig } from "@/lib/site";
import { LogoIcon } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-header max-w-[100rem] items-center gap-2 px-4 sm:px-6">
        <MobileNav />

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <LogoIcon />
        </Link>

        <MainNavLinks />

        <div className="ml-auto flex items-center gap-1.5">
          <CommandMenu />
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <GitHubIcon className="h-4 w-4" />
            <span className="sr-only">GitHub repository</span>
          </a>
          <a
            href={siteConfig.links.npm}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:inline-flex dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <NpmIcon className="h-4 w-4" />
            <span className="sr-only">npm package</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
