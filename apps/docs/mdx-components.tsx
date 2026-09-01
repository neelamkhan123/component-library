import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import Link from "next/link";
import { ComponentPreview } from "@/components/component-preview";
import { PropsTable } from "@/components/props-table";
import { CodeBlock } from "@/components/code-block";
import { Callout } from "@/components/callout";
import { KeyboardTable } from "@/components/keyboard-table";
import { PageHeader } from "@/components/page-header";
import { InstallCommand } from "@/components/install-command";
import { ComponentGrid } from "@/components/component-grid";
import { cn } from "@/lib/utils";

/**
 * Headings get a hover-revealed anchor rather than a permanently visible `#`.
 * The link wraps only the marker, so the heading text itself stays plain for
 * screen readers reading the outline.
 */
function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const sizes = {
    2: "mt-14 mb-4 text-2xl font-semibold tracking-tight border-b border-slate-200 pb-2 dark:border-slate-800",
    3: "mt-10 mb-3 text-xl font-semibold tracking-tight",
    4: "mt-8 mb-2 text-base font-semibold tracking-tight",
  };

  return function Heading({ id, children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag id={id} className={cn("group scroll-mt-24", sizes[level], className)} {...props}>
        {children}
        {id ? (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 dark:text-slate-600"
          >
            #
          </a>
        ) : null}
      </Tag>
    );
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1 className={cn("mb-3 text-3xl font-bold tracking-tight sm:text-4xl", className)} {...props} />
    ),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),

    p: ({ className, ...props }) => (
      <p className={cn("my-4 leading-7 text-slate-700 dark:text-slate-300", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-4 ml-5 list-disc space-y-2 text-slate-700 marker:text-slate-400 dark:text-slate-300", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-4 ml-5 list-decimal space-y-2 text-slate-700 marker:text-slate-400 dark:text-slate-300", className)} {...props} />
    ),
    li: ({ className, ...props }) => <li className={cn("leading-7 pl-1", className)} {...props} />,
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("my-6 border-l-2 border-accent-400 pl-4 italic text-slate-600 dark:text-slate-400", className)} {...props} />
    ),
    hr: ({ className, ...props }) => (
      <hr className={cn("my-10 border-slate-200 dark:border-slate-800", className)} {...props} />
    ),
    strong: ({ className, ...props }) => (
      <strong className={cn("font-semibold text-slate-950 dark:text-white", className)} {...props} />
    ),

    a: ({ href = "", className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const isInternal = href.startsWith("/") || href.startsWith("#");
      const styles = cn(
        "font-medium text-accent-600 underline underline-offset-4 transition-colors hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300",
        className,
      );
      return isInternal ? (
        <Link href={href} className={styles} {...props} />
      ) : (
        <a href={href} target="_blank" rel="noreferrer" className={styles} {...props} />
      );
    },

    // Inline code only — fenced blocks arrive already wrapped by
    // rehype-pretty-code, whose own <code> lives inside a <pre>.
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
          className,
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "scroll-x my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 py-4 text-[13px] leading-relaxed dark:border-slate-800 dark:bg-slate-900/60 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit",
          className,
        )}
        {...props}
      />
    ),

    table: ({ className, ...props }) => (
      <div
        className="scroll-x my-6 rounded-xl border border-slate-200 dark:border-slate-800"
        tabIndex={0}
      >
        <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn("bg-slate-50 dark:bg-slate-900/60", className)} {...props} />
    ),
    tr: ({ className, ...props }) => (
      <tr className={cn("border-b border-slate-200 last:border-0 dark:border-slate-800", className)} {...props} />
    ),
    th: ({ className, ...props }) => (
      <th className={cn("px-4 py-2.5 font-medium", className)} {...props} />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("px-4 py-3 align-top text-slate-700 dark:text-slate-300", className)} {...props} />
    ),

    // Available in every .mdx file without an import.
    ComponentPreview,
    PropsTable,
    CodeBlock,
    Callout,
    KeyboardTable,
    PageHeader,
    InstallCommand,
    ComponentGrid,

    ...components,
  };
}
