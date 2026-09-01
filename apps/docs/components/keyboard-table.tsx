type Shortcut = { keys: string; description: string };

/**
 * Keyboard support is the whole point of this library, so it gets a
 * first-class block on every component page rather than a bullet list.
 */
export function KeyboardTable({ shortcuts }: { shortcuts: Shortcut[] }) {
  return (
    <div
      className="scroll-x my-6 rounded-xl border border-slate-200 dark:border-slate-800"
      tabIndex={0}
      role="group"
      aria-label="Keyboard shortcuts"
    >
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Keyboard shortcuts</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
            <th scope="col" className="w-48 px-4 py-2.5 font-medium">Key</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Behaviour</th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((shortcut) => (
            <tr
              key={shortcut.keys}
              className="border-b border-slate-200 last:border-0 dark:border-slate-800"
            >
              <td className="px-4 py-3 align-top">
                <span className="flex flex-wrap gap-1">
                  {shortcut.keys.split(" / ").map((key) => (
                    <kbd
                      key={key}
                      className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </td>
              <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300">
                {shortcut.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
