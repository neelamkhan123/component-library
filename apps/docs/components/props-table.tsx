import propsData from "@/lib/props.generated.json";
import { cn } from "@/lib/utils";

type Prop = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

const registry = propsData as Record<string, Prop[]>;

export function PropsTable({ name }: { name: string }) {
  const props = registry[name];

  if (!props?.length) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        No props were extracted for <code className="font-mono">{name}</code>. It may be a
        compound export with no props of its own, or it may need a TSDoc comment on its
        props interface — <code className="font-mono">npm run gen</code> rebuilds this table.
      </div>
    );
  }

  return (
    <div
      className="scroll-x my-6 rounded-xl border border-slate-200 dark:border-slate-800"
      // Horizontally scrollable, so it must be focusable to be scrollable by
      // keyboard alone (WCAG 2.1.1).
      tabIndex={0}
      role="group"
      aria-label={`${name} props`}
    >
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Props for {name}</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
            <th scope="col" className="px-4 py-2.5 font-medium">Prop</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr
              key={prop.name}
              className="border-b border-slate-200 last:border-0 align-top dark:border-slate-800"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="font-mono text-[13px] text-accent-700 dark:text-accent-300">
                  {prop.name}
                </code>
                {prop.required ? (
                  <span className="ml-1.5 align-top text-[10px] font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                    required
                  </span>
                ) : null}
                {prop.description ? (
                  <p className="mt-1 max-w-md text-[13px] font-normal text-slate-500 dark:text-slate-400">
                    {prop.description}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <code
                  className={cn(
                    "font-mono text-[12px] break-words text-slate-600 dark:text-slate-300",
                    prop.type.length > 60 && "block max-w-[18rem]",
                  )}
                >
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {prop.defaultValue ? (
                  <code className="font-mono text-[12px] text-slate-600 dark:text-slate-300">
                    {prop.defaultValue}
                  </code>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
