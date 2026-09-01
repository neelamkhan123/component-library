import { Fragment, type ReactNode } from "react";

/**
 * Renders the small subset of Markdown that appears inside changelog bullets:
 * `code` spans and [links](url). Deliberately not a general parser — anything
 * richer belongs in an .mdx file, where the real pipeline runs.
 */
export function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>);
    }

    if (match[1]) {
      nodes.push(
        <code
          key={key++}
          className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {match[1]}
        </code>,
      );
    } else {
      nodes.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent-600 underline underline-offset-4 dark:text-accent-400"
        >
          {match[2]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{nodes}</>;
}
