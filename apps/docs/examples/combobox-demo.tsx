"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTriggerIcon,
} from "@neelamkhan21/ui";

const fruits = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Cherry",
  "Date",
  "Elderberry",
];

export default function ComboboxDemo() {
  return (
    <label className="flex w-64 flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
      Fruit
      <Combobox>
        <div className="relative">
          <ComboboxInput placeholder="Search fruit…" className="pr-8" />
          <ComboboxTriggerIcon className="absolute top-1/2 right-3 -translate-y-1/2" />
        </div>
        <ComboboxContent>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit.toLowerCase()}>
              {fruit}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </label>
  );
}
