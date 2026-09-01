"use client";

import { Input } from "neelam-ui";

export default function InputInvalid() {
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <label
        htmlFor="email-invalid"
        className="text-sm font-medium text-slate-950 dark:text-white"
      >
        Email
      </label>
      <Input
        id="email-invalid"
        type="email"
        defaultValue="not-an-email"
        aria-invalid
        // Points at the message below, so the error is announced as part of
        // the field rather than being merely red text next to it.
        aria-describedby="email-invalid-error"
      />
      <p
        id="email-invalid-error"
        className="text-xs text-red-600 dark:text-red-400"
      >
        Enter a valid email address.
      </p>
    </div>
  );
}
