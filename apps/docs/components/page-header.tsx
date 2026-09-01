import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function PageHeader({
  title,
  description,
  /** Exported name in the library — adds source and Storybook links. */
  componentName,
}: {
  title: string;
  description: string;
  componentName?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="scroll-mt-20 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{description}</p>
      {componentName ? (
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <a
            href={`${siteConfig.links.github}/blob/main/packages/ui/src/components/${componentName}/${componentName}.tsx`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            Source
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <a
            href={siteConfig.links.storybook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            Storybook
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <Link
            href="/docs/accessibility"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            Accessibility
          </Link>
        </div>
      ) : null}
    </div>
  );
}
