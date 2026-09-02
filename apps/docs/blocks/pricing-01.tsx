"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "neelam-ui";

interface Plan {
  name: string;
  monthly: number;
  description: string;
  cta: string;
  featured?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    name: "Starter",
    monthly: 0,
    description: "For a side project that hasn't found its shape yet.",
    cta: "Start for free",
    features: [
      "Up to 3 projects",
      "One seat",
      "Community support",
      "7-day activity history",
    ],
  },
  {
    name: "Pro",
    monthly: 24,
    description: "For a small team shipping to real users every week.",
    cta: "Start free trial",
    featured: true,
    features: [
      "Unlimited projects",
      "10 seats included",
      "Priority email support",
      "12-month activity history",
      "Custom domains",
    ],
  },
  {
    name: "Team",
    monthly: 96,
    description: "For an organisation with compliance to answer to.",
    cta: "Talk to sales",
    features: [
      "Everything in Pro",
      "SAML single sign-on",
      "Audit log and data export",
      "Dedicated environment",
      "99.9% uptime SLA",
    ],
  },
];

export default function Pricing01() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
          Pricing that stops at the seat count
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
          Every plan includes the whole product. What changes is how many
          projects and people it has to carry.
        </p>

        {/* The switch is the control, so the two period names sit beside it
            as labels rather than as a pair of competing buttons. Neither is
            the switch's accessible name — "Annual" alone wouldn't say what
            turning it on does. */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={
              annual
                ? "text-sm text-slate-500 dark:text-slate-400"
                : "text-sm font-medium text-slate-950 dark:text-white"
            }
          >
            Monthly
          </span>
          <Switch
            checked={annual}
            onCheckedChange={setAnnual}
            aria-label="Bill annually"
          />
          <span
            className={
              annual
                ? "text-sm font-medium text-slate-950 dark:text-white"
                : "text-sm text-slate-500 dark:text-slate-400"
            }
          >
            Annual
          </span>
          <Badge variant="secondary">Save 20%</Badge>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = annual
            ? Math.round(plan.monthly * 0.8)
            : plan.monthly;

          return (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "flex flex-col border-slate-950 dark:border-white"
                  : "flex flex-col"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.featured ? <Badge>Most popular</Badge> : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    /seat /month
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {annual ? "Billed annually" : "Billed monthly"}
                  {annual && price > 0 ? ` · $${price * 12}/year` : null}
                </p>

                <Separator className="my-5" />

                <ul className="flex flex-col gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-950 dark:text-white"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3">
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
                {plan.monthly > 0 ? (
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Extra seats{" "}
                    <Tooltip>
                      <TooltipTrigger className="underline decoration-dotted underline-offset-4">
                        prorated
                        <Info
                          className="ml-1 inline h-3 w-3 align-[-0.1em]"
                          aria-hidden="true"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        Added mid-cycle, charged only for the days remaining.
                      </TooltipContent>
                    </Tooltip>
                  </p>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-slate-600 dark:text-slate-400">
        Prices exclude VAT. Non-profits and students get 50% off —{" "}
        <a
          href="#"
          className="font-medium text-slate-950 underline underline-offset-4 dark:text-white"
        >
          apply here
        </a>
        .
      </p>
    </div>
  );
}
