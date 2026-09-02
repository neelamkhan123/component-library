"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Button,
  Checkbox,
  Input,
  Progress,
  Separator,
} from "neelam-ui";

const strengthLabels = ["Too short", "Weak", "Fair", "Strong"] as const;

/** Deliberately crude — a real app would use zxcvbn or similar. */
function scorePassword(value: string): number {
  if (value.length < 8) return 0;
  let score = 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1;
  return score;
}

export default function Signup01() {
  const [password, setPassword] = useState("");
  const score = scorePassword(password);

  return (
    <div className="grid min-h-full w-full lg:grid-cols-2">
      {/* Form first in the DOM so the keyboard and screen-reader path starts
          with the thing the page is for, whichever side it renders on. */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Free for 14 days. No card required, and nothing renews on its own.
          </p>

          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                First name
                <Input autoComplete="given-name" placeholder="Ada" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                Last name
                <Input autoComplete="family-name" placeholder="Lovelace" />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
              Work email
              <Input
                type="email"
                autoComplete="email"
                placeholder="ada@northstar.io"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
              Password
              <Input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby="password-strength"
              />
            </label>

            {/* The bar is one signal and the words are another, so strength
                is never carried by colour or length alone. */}
            <div id="password-strength" className="flex flex-col gap-1.5">
              <Progress
                value={(score / 3) * 100}
                aria-label="Password strength"
                className="h-1.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {password.length === 0
                  ? "At least 8 characters, with a number and a symbol."
                  : strengthLabels[score]}
              </p>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
              <Checkbox className="mt-0.5" />
              <span>
                I agree to the{" "}
                <a href="#" className="underline underline-offset-4">
                  terms of service
                </a>{" "}
                and the{" "}
                <a href="#" className="underline underline-offset-4">
                  privacy policy
                </a>
                .
              </span>
            </label>

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full">
            Continue with SSO
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <a
              href="#"
              className="font-medium text-slate-950 underline underline-offset-4 dark:text-white"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* The marketing panel is supporting material, so it drops out entirely
          below `lg` rather than pushing the form down a screen. */}
      <aside className="hidden flex-col justify-center gap-8 border-l border-slate-200 bg-slate-50 px-12 py-12 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <figure className="flex flex-col gap-6">
          <Quote
            className="h-8 w-8 text-slate-300 dark:text-slate-700"
            aria-hidden="true"
          />
          <blockquote className="text-xl font-medium leading-relaxed text-slate-950 dark:text-white">
            We replaced three internal dashboards with one Northstar workspace.
            The rollout took an afternoon.
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/128?img=12" alt="" />
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
            <span className="flex flex-col text-sm">
              <span className="font-medium text-slate-950 dark:text-white">
                Grace Hopper
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                VP Engineering, Contoso
              </span>
            </span>
          </figcaption>
        </figure>

        <Separator />

        <div className="flex items-center gap-4">
          {/* No `total` — the count is in the sentence beside it, and an
              overflow chip reading "+2,395" is a number nobody parses. */}
          <AvatarGroup label="Recent signups" max={4}>
            {["AL", "AT", "KJ", "MH", "RP"].map((initials) => (
              <Avatar key={initials} size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Joined by 2,400 teams in the last year.
          </p>
        </div>
      </aside>
    </div>
  );
}
