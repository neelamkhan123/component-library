import { highlight } from "@/lib/highlight";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export async function CodeBlock({
  code,
  lang = "tsx",
  className,
  copyable = true,
  maxHeight,
}: {
  code: string;
  lang?: string;
  className?: string;
  copyable?: boolean;
  /** e.g. "22rem" — collapses tall sources into their own scroll box. */
  maxHeight?: string;
}) {
  const html = await highlight(code, lang);

  return (
    <div className={cn("group relative", className)}>
      {copyable ? (
        <CopyButton
          value={code.trim()}
          className="absolute right-3 top-3 z-10 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        />
      ) : null}
      <div
        className="scroll-x overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-relaxed dark:border-slate-800 dark:bg-slate-900/60 [&_pre]:bg-transparent! [&_code]:font-mono"
        style={maxHeight ? { maxHeight } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
