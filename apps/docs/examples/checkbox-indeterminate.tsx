"use client";

import { useState } from "react";
import { Checkbox } from "neelam-ui";

const permissions = ["Read", "Write", "Delete"];

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<string[]>(["Read"]);

  const all = selected.length === permissions.length;
  const none = selected.length === 0;

  return (
    <fieldset className="flex w-64 flex-col gap-3">
      <legend className="sr-only">Permissions</legend>

      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-950 dark:text-white">
        <Checkbox
          // The parent is neither on nor off while the children disagree.
          checked={all ? true : none ? false : "indeterminate"}
          onCheckedChange={(checked) =>
            setSelected(checked ? [...permissions] : [])
          }
        />
        Select all
      </label>

      <div className="ml-6 flex flex-col gap-2 border-l border-slate-200 pl-4 dark:border-slate-800">
        {permissions.map((permission) => (
          <label
            key={permission}
            className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300"
          >
            <Checkbox
              checked={selected.includes(permission)}
              onCheckedChange={(checked) =>
                setSelected((current) =>
                  checked
                    ? [...current, permission]
                    : current.filter((item) => item !== permission),
                )
              }
            />
            {permission}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
