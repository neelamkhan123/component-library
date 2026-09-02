import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { PreviewTabs } from "@/components/preview-tabs";
import { componentFor, type BlockMeta } from "@/lib/blocks";
import { getBlockSource } from "@/lib/blocks.generated";
import { BlockFrame } from "@/components/block-frame";

/**
 * One block on the /blocks index: what it is, what it is made of, and the
 * block itself running — in the same Preview/Code tabs a component page
 * uses, so the two pages behave identically.
 */
export function BlockPreview({
  block,
  headingLevel = 3,
}: {
  block: BlockMeta;
  /** So the heading fits the host page's outline. */
  headingLevel?: 2 | 3;
}) {
  const source = getBlockSource(block.slug);
  const Heading = `h${headingLevel}` as const;

  if (!source) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        No block registered under <code className="font-mono">{block.slug}</code>.
        Add <code className="font-mono">apps/docs/blocks/{block.slug}.tsx</code> and
        re-run <code className="font-mono">npm run gen</code>.
      </div>
    );
  }

  const { Component, code } = source;

  return (
    <section aria-labelledby={`block-${block.slug}`} className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="max-w-2xl">
          <Heading
            id={`block-${block.slug}`}
            className="text-lg font-semibold text-slate-950 dark:text-white"
          >
            {block.title}
          </Heading>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {block.description}
          </p>
        </div>

        <Link
          href={`/blocks/${block.slug}`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Full width
          <span className="sr-only">view of {block.title}</span>
        </Link>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {block.uses.map((name) => {
          const component = componentFor(name);
          if (!component) return null;

          return (
            <li key={name}>
              <Link
                href={`/docs/components/${component.slug}`}
                className="inline-flex rounded-full border border-slate-200 px-2.5 py-0.5 font-mono text-xs text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>

      <PreviewTabs
        preview={
          <BlockFrame height={block.height}>
            <Component />
          </BlockFrame>
        }
        code={<CodeBlock code={code} maxHeight="30rem" />}
      />
    </section>
  );
}
