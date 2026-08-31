import Link from "next/link";
import { components, componentGroupOrder, documented } from "@/lib/nav";

export function ComponentGrid({
  group,
  /** Heading level for the group headings, so they fit the host page's outline. */
  headingLevel = 2,
}: {
  group?: string;
  headingLevel?: 2 | 3;
}) {
  const groups = group ? [group] : [...componentGroupOrder];
  const Heading = `h${headingLevel}` as const;

  return (
    <div className="my-8 space-y-10">
      {groups.map((name) => {
        const items = components.filter((component) => component.group === name);
        if (!items.length) return null;

        return (
          <section key={name}>
            <Heading className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {name}
              <span className="ml-2 font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400">
                {items.length}
              </span>
            </Heading>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((component) => (
                <li key={component.slug}>
                  <Link
                    href={`/docs/components/${component.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {component.title}
                      {!documented.has(component.slug) ? (
                        <span className="rounded-full border border-slate-200 px-1.5 py-px text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400">
                          WIP
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {component.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
