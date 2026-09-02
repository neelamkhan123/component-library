"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Separator,
} from "neelam-ui";

export default function Login01() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  // Validate on submit rather than on every keystroke: telling someone their
  // email is invalid while they are still halfway through typing it is noise.
  const invalid = submitted && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setPending(true);
    setTimeout(() => setPending(false), 900);
  }

  return (
    <div className="flex min-h-full w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Northstar</CardTitle>
            <CardDescription>
              Use your work account. Single sign-on is available on the Team plan.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full">
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full">
                Continue with GitHub
              </Button>
            </div>

            {/* A labelled rule, so the divider isn't carrying meaning by
                position alone. */}
            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                or
              </span>
              <Separator className="flex-1" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                Email
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="ada@northstar.io"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? "login-email-error" : undefined}
                />
                {invalid ? (
                  // Announced because it appears after the field has been
                  // left, not while it is being typed in.
                  <span
                    id="login-email-error"
                    role="alert"
                    className="text-xs font-normal text-red-700 dark:text-red-400"
                  >
                    Enter an email address in the form name@example.com.
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                <span className="flex items-baseline justify-between gap-2">
                  Password
                  <a
                    href="#"
                    className="text-xs font-normal text-slate-600 underline-offset-4 hover:underline dark:text-slate-400"
                  >
                    Forgot password?
                  </a>
                </span>
                <Input type="password" autoComplete="current-password" />
              </label>

              <label className="flex items-center gap-2.5 text-sm font-normal text-slate-700 dark:text-slate-300">
                <Checkbox defaultChecked />
                Keep me signed in for 30 days
              </label>

              <Button type="submit" className="w-full" loading={pending}>
                Sign in
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              New here?{" "}
              <a
                href="#"
                className="font-medium text-slate-950 underline underline-offset-4 dark:text-white"
              >
                Create an account
              </a>
            </p>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          By signing in you agree to the{" "}
          <a href="#" className="underline underline-offset-4">
            terms of service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
