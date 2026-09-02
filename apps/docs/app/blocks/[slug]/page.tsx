import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { blocks, componentFor, getBlock } from "@/lib/blocks";
import { getBlockSource } from "@/lib/blocks.generated";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const block = getBlock((await params).slug);
  if (!block) return {};

  return { title: block.title, description: block.description };
}

export default async function BlockPage({ params }: Params) {
  const { slug } = await params;
  const block = getBlock(slug);
  const source = block ? getBlockSource(block.slug) : undefined;

  if (!block || !source) notFound();

  const { Component, code } = source;

  return (
    <main id="main">
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex h-14 max-w-[100rem] items-center gap-3 px-4 sm:px-6">
          <Link
            href="/blocks"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Blocks
          </Link>
          <span
            aria-hidden="true"
            className="text-slate-300 dark:text-slate-700"
          >
            /
          </span>
          <h1 className="truncate text-sm font-medium">{block.title}</h1>
          <a
            href="#source"
            className="ml-auto shrink-0 rounded-md text-sm text-slate-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-slate-400"
          >
            Jump to source
          </a>
        </div>
      </div>

      {/*
        A real viewport, not a simulated one: the block gets the whole width
        the window has, so Tailwind's breakpoints answer to the browser the
        way they will in the reader's own app. Resizing the window is the
        responsive test.
      */}
      <div className="h-[calc(100dvh-var(--spacing-header)-3.5rem)] overflow-y-auto">
        <Component />
      </div>

      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6">
        <h2 id="source" className="scroll-mt-20 text-xl font-semibold">
          Source
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {block.description} Built from{" "}
          {block.uses.map((name, index) => {
            const component = componentFor(name);
            const separator =
              index === block.uses.length - 1
                ? ""
                : index === block.uses.length - 2
                  ? " and "
                  : ", ";

            return (
              <span key={name}>
                {component ? (
                  <Link
                    href={`/docs/components/${component.slug}`}
                    className="font-mono text-slate-950 underline underline-offset-4 dark:text-white"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="font-mono">{name}</span>
                )}
                {separator}
              </span>
            );
          })}
          .
        </p>

        <div className="mt-6">
          <CodeBlock code={code} />
        </div>
      </div>
    </main>
  );
}
