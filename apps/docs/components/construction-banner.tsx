import { AlertTriangle, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * Temporary notice while the docs UI is being reworked. It sits above the
 * header in normal flow rather than inside it, so it scrolls away and leaves
 * the `sticky top-header` offsets the sidebar and TOC depend on untouched.
 *
 * Delete this file and its one use in `app/layout.tsx` when the rebuild lands.
 */
export function ConstructionBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
      <div className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-sm sm:px-6">
        <AlertTriangle
          className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <span className="text-amber-900 dark:text-amber-100">
          This site is under construction — some pages are incomplete or
          unstyled.
        </span>
        <a
          href={siteConfig.links.storybook}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1 rounded-sm font-medium text-amber-900 underline underline-offset-2 transition-colors hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-amber-100 dark:hover:text-white dark:focus-visible:ring-amber-400"
        >
          Browse the Storybook docs
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
}
