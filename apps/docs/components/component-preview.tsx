import { getExample } from "@/lib/examples.generated";
import { CodeBlock } from "@/components/code-block";
import { PreviewTabs } from "@/components/preview-tabs";
import { cn } from "@/lib/utils";

export function ComponentPreview({
  name,
  className,
  /** Demos that need room (tables, charts) read better left-aligned and full width. */
  align = "center",
}: {
  name: string;
  className?: string;
  align?: "center" | "start";
}) {
  const example = getExample(name);

  if (!example) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        No example registered under <code className="font-mono">{name}</code>. Add{" "}
        <code className="font-mono">apps/docs/examples/{name}.tsx</code> and re-run{" "}
        <code className="font-mono">npm run gen</code>.
      </div>
    );
  }

  const { Component, code } = example;

  return (
    <PreviewTabs
      preview={
        <div
          className={cn(
            "flex min-h-[22rem] w-full rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950",
            align === "center"
              ? "items-center justify-center"
              : "items-start justify-start overflow-x-auto",
            className,
          )}
        >
          <Component />
        </div>
      }
      code={<CodeBlock code={code} maxHeight="26rem" />}
    />
  );
}
