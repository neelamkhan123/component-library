import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { InlineMarkdown } from "@/components/inline-markdown";
import { getChangelog } from "@/lib/changelog";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release notes for @neelamkhan21/ui, generated from the package changelog.",
};

const badgeStyles: Record<string, string> = {
  major: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  minor: "bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300",
  patch: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function ChangelogPage() {
  const entries = getChangelog();

  return (
    <>
      <PageHeader
        title="Changelog"
        description="Every release, taken directly from the package's own changelog at build time."
      />

      <div className="space-y-12">
        {entries.map((entry) => (
          <section key={entry.version}>
            <h2
              id={`v${entry.version}`}
              className="scroll-mt-24 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight dark:border-slate-800"
            >
              {entry.version}
            </h2>

            {entry.sections.map((section) => {
              const kind = section.kind.split(" ")[0].toLowerCase();
              return (
                <div key={section.kind} className="mt-5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      badgeStyles[kind] ?? badgeStyles.patch
                    }`}
                  >
                    {section.kind}
                  </span>
                  <ul className="mt-3 ml-5 list-disc space-y-3 text-slate-700 marker:text-slate-400 dark:text-slate-300">
                    {section.items.map((item, index) => (
                      <li key={index} className="pl-1 leading-7">
                        <InlineMarkdown text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-slate-500 dark:text-slate-400">
        Releases are managed with{" "}
        <a
          href="https://github.com/changesets/changesets"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent-600 underline underline-offset-4 dark:text-accent-400"
        >
          changesets
        </a>
        . See the{" "}
        <a
          href={`${siteConfig.links.github}/releases`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent-600 underline underline-offset-4 dark:text-accent-400"
        >
          GitHub releases
        </a>{" "}
        for tagged builds.
      </p>
    </>
  );
}
