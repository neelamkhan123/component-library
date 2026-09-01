"use client";

import { RadioGroup, RadioGroupItem } from "neelam-ui";

const plans = [
  { value: "starter", label: "Starter", hint: "Up to 3 projects" },
  { value: "pro", label: "Pro", hint: "Unlimited projects" },
  { value: "team", label: "Team", hint: "Shared workspaces and roles" },
];

export default function RadioGroupDemo() {
  return (
    // The group needs its own name — role="radiogroup" carries no label of
    // its own, and the visible heading is the natural one to point at.
    <div className="w-72">
      <p
        id="plan-label"
        className="mb-3 text-sm font-medium text-slate-950 dark:text-white"
      >
        Plan
      </p>
      <RadioGroup defaultValue="pro" aria-labelledby="plan-label">
        {plans.map((plan) => (
          <label
            key={plan.value}
            className="flex items-start gap-2.5 text-sm text-slate-950 dark:text-white"
          >
            <RadioGroupItem value={plan.value} className="mt-0.5" />
            <span>
              {plan.label}
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {plan.hint}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
