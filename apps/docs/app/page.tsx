import Link from "next/link";
import {
  ArrowRight,
  Accessibility,
  Blocks,
  Keyboard,
  Moon,
  ShieldCheck,
  Zap,
  Handshake,
} from "lucide-react";
import { HeroShowcase } from "@/components/hero-showcase";
import { Reveal } from "@/components/reveal";
import { CodeBlock } from "@/components/code-block";
import { BlockFrame } from "@/components/block-frame";
import { GitHubIcon } from "@/components/icons";
import { components } from "@/lib/nav";
import { blocks, featuredBlockSlug, getBlock } from "@/lib/blocks";
import { getBlockSource } from "@/lib/blocks.generated";
import { siteConfig } from "@/lib/site";

const features = [
  {
    Icon: Handshake,
    title: "WAI-ARIA APG patterns",
    body: "Every interactive component follows the Authoring Practices Guide pattern for its widget type — roles, states, and properties included.",
  },
  {
    Icon: Keyboard,
    title: "Real keyboard support",
    body: "Roving tabindex, typeahead, Home/End, and Escape behaviour are implemented per pattern, not approximated.",
  },
  {
    Icon: ShieldCheck,
    title: "axe-core in CI",
    body: "Every story is checked against axe-core on every pull request, so accessibility regressions fail the build before merge.",
  },
  {
    Icon: Blocks,
    title: "Semantic HTML first",
    body: "Native elements wherever they exist. Dialog is a real <dialog> with showModal(), so focus trapping comes from the browser.",
  },
  {
    Icon: Moon,
    title: "Light and dark",
    body: "Class-based dark mode on every component, with all motion dropped under prefers-reduced-motion.",
  },
  {
    Icon: Zap,
    title: "Typed and tree-shakeable",
    body: "Shipped as ESM and CJS with full type declarations. No stylesheet, no runtime CSS-in-JS, no bundled dependencies.",
  },
];

const featuredBlock = getBlock(featuredBlockSlug);
const featuredBlockSource = getBlockSource(featuredBlockSlug);

export default function HomePage() {
  const FeaturedBlock = featuredBlockSource?.Component;

  return (
    <main id="main">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden">
          {/* Decorative only — a soft radial wash behind the hero. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_35rem_at_50%_-10%,var(--color-accent-100),transparent)] dark:bg-[radial-gradient(60rem_35rem_at_50%_-10%,var(--color-accent-950),transparent)]"
          />
          <div className="mx-auto max-w-[100rem] px-4 py-16 sm:px-6 sm:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ">
              <div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Accessible React components,
                  <span className="block text-slate-500 dark:text-slate-400">
                    without the compromise.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">
                  Components built on semantic HTML and the WAI-ARIA Authoring
                  Practices Guide. Keyboard navigation, focus management, and
                  ARIA correctness are the starting point.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/docs"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-950"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-6 text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    <GitHubIcon className="h-4 w-4" />
                    GitHub
                  </a>
                </div>

                <div className="mt-8 max-w-md">
                  <CodeBlock code="npm install neelam-ui" lang="bash" />
                </div>
              </div>

              <section aria-labelledby="showcase-heading" className="lg:pl-4">
                <h2 id="showcase-heading" className="sr-only">
                  Example interface built with the library
                </h2>
                <HeroShowcase />
              </section>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Features */}
      <Reveal>
        <section className="mx-auto max-w-[100rem] px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for the keyboard first
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            Accessibility here means specific, testable behaviour — not a claim
            in a README.
          </p>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, body }) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200 p-6 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* Blocks */}
      <Reveal>
        <section className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-[100rem] px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Blocks
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Whole screens, already assembled
                </h2>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Dashboards, settings pages, sign-in screens, pricing tables
                  and chat panels — built from these components, running live
                  on the page, with the source next to each one. Copy a block
                  and it is yours: no new dependency, nothing to configure.
                </p>
              </div>
              <Link
                href="/blocks"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-6 text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                Browse all {blocks.length} blocks
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {FeaturedBlock && featuredBlock ? (
              <figure className="mt-10">
                <BlockFrame height="34rem">
                  <FeaturedBlock />
                </BlockFrame>
                <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-950 dark:text-white">
                    {featuredBlock.title}
                  </span>
                  <span>{featuredBlock.description}</span>
                  <Link
                    href={`/blocks/${featuredBlock.slug}`}
                    className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white"
                  >
                    View source
                  </Link>
                </figcaption>
              </figure>
            ) : null}

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blocks
                .filter((block) => block.slug !== featuredBlockSlug)
                .map((block) => (
                  <li key={block.slug}>
                    <Link
                      href={`/blocks/${block.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-slate-200 p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                    >
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {block.category}
                      </span>
                      <span className="mt-1 font-semibold">{block.title}</span>
                      <span className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {block.description}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* Closing CTA */}
      <Reveal>
        <section className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-[100rem] px-4 py-16 text-center sm:px-6 sm:py-24">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {components.length} components, one install
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
              Dialogs, combos, data tables, charts, and a full set of chat
              primitives. All typed, all themeable, all keyboard operable.
            </p>
            <Link
              href="/docs/components/button"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-950"
            >
              Browse components
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-[100rem] flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
            <p>
              MIT © {siteConfig.author}. Built with{" "}
              <Link
                href="/docs"
                className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white"
              >
                {siteConfig.name}
              </Link>
              .
            </p>
            <div className="flex gap-5">
              <a
                href={siteConfig.links.npm}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-950 dark:hover:text-white"
              >
                npm
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-950 dark:hover:text-white"
              >
                GitHub
              </a>
              <a
                href={siteConfig.links.storybook}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-950 dark:hover:text-white"
              >
                Storybook
              </a>
            </div>
          </div>
        </footer>
      </Reveal>
    </main>
  );
}
