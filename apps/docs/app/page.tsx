import Link from "next/link";
import { ArrowRight, Accessibility, Blocks, Keyboard, Moon, ShieldCheck, Zap } from "lucide-react";
import { HeroShowcase } from "@/components/hero-showcase";
import { CodeBlock } from "@/components/code-block";
import { GitHubIcon } from "@/components/icons";
import { components } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

const features = [
  {
    Icon: Accessibility,
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

export default function HomePage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {/* Decorative only — a soft radial wash behind the hero. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_35rem_at_50%_-10%,var(--color-accent-100),transparent)] dark:bg-[radial-gradient(60rem_35rem_at_50%_-10%,var(--color-accent-950),transparent)]"
        />
        <div className="mx-auto max-w-[100rem] px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Link
                href="/docs/changelog"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-medium backdrop-blur transition-colors hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900"
              >
                <span className="rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] text-white">
                  New
                </span>
                v1.2.1 — Avatar fallback fix
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Accessible React components,
                <span className="block text-slate-500 dark:text-slate-400">
                  without the compromise.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">
                {components.length} components built on semantic HTML and the WAI-ARIA
                Authoring Practices Guide. Keyboard navigation, focus management, and
                ARIA correctness are the starting point — not a later pass.
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
                <CodeBlock code="npm install @neelamkhan21/ui" lang="bash" />
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

      {/* Features */}
      <section className="mx-auto max-w-[100rem] px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Built for the keyboard first
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          Accessibility here means specific, testable behaviour — not a claim in a README.
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
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-[100rem] px-4 py-16 text-center sm:px-6 sm:py-24">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {components.length} components, one install
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Dialogs, combos, data tables, charts, and a full set of chat primitives —
            all typed, all themeable, all keyboard operable.
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

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-[100rem] flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <p>
            MIT © {siteConfig.author}. Built with{" "}
            <Link href="/docs" className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white">
              {siteConfig.name}
            </Link>
            .
          </p>
          <div className="flex gap-5">
            <a href={siteConfig.links.npm} target="_blank" rel="noreferrer" className="hover:text-slate-950 dark:hover:text-white">
              npm
            </a>
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className="hover:text-slate-950 dark:hover:text-white">
              GitHub
            </a>
            <a href={siteConfig.links.storybook} target="_blank" rel="noreferrer" className="hover:text-slate-950 dark:hover:text-white">
              Storybook
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
