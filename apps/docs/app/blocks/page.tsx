import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlockPreview } from "@/components/block-preview";
import { Reveal } from "@/components/reveal";
import { blocks, blockCategoryOrder } from "@/lib/blocks";

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Ready-made sections and screens assembled from neelam-ui components — dashboards, settings, auth, pricing, and chat. Copy the source and adapt it.",
};

const anchor = (category: string) =>
  category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function BlocksPage() {
  return (
    <main id="main" className="mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blocks</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Whole screens and sections, assembled from the same{" "}
          <Link
            href="/docs/components/button"
            className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white"
          >
            components
          </Link>{" "}
          the rest of these docs cover. Every block is real, running code — read
          it, copy it, and change the parts that are yours.
        </p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Nothing here is a new dependency: a block is a file you own, so
          there is no <code className="font-mono">Block</code> component to
          import and no API to learn.
        </p>
      </header>

      <nav aria-label="Block categories" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {blockCategoryOrder.map((category) => {
            const count = blocks.filter(
              (block) => block.category === category,
            ).length;

            return (
              <li key={category}>
                <a
                  href={`#${anchor(category)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  {category}
                  <span className="text-slate-500 dark:text-slate-400">
                    {count}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-12 flex flex-col gap-16">
        {blockCategoryOrder.map((category) => {
          const items = blocks.filter((block) => block.category === category);
          if (!items.length) return null;

          return (
            <section
              key={category}
              aria-labelledby={anchor(category)}
              className="scroll-mt-20"
            >
              <h2
                id={anchor(category)}
                className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {category}
              </h2>

              <div className="mt-6 flex flex-col gap-14">
                {items.map((block) => (
                  <Reveal key={block.slug}>
                    <BlockPreview block={block} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-20 border-t border-slate-200 pt-10 dark:border-slate-800">
        <h2 className="text-2xl font-bold tracking-tight">
          Build one of your own
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          Blocks are ordinary compositions — no wrapper, no configuration, no
          registry to publish to. Start from the component that carries the
          layout and add the rest around it.
        </p>
        <Link
          href="/docs/installation"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-950"
        >
          Install the library
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
