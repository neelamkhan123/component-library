import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card } from "../Card/Card";
import { Sparkline } from "../Sparkline/Sparkline";
import { mergeClassNames } from "../../utils/mergeClassNames";

/** Whether a rise in this metric is good news, bad news, or neither. */
export type StatCardDeltaDirection = "up-is-good" | "down-is-good" | "neutral";

/** Formats a delta as a signed percentage — `0.124` becomes `+12.4%`. */
function formatDeltaAsPercent(delta: number): string {
  const percent = (delta * 100).toFixed(1).replace(/\.0$/, "");
  return `${delta > 0 ? "+" : ""}${percent}%`;
}

const deltaToneClassNames = {
  good: "text-green-700 dark:text-green-400",
  bad: "text-red-700 dark:text-red-400",
  neutral: "text-slate-500 dark:text-slate-400",
} as const;

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** What the number measures, in sentence case and without a trailing colon. */
  label: ReactNode;
  /** The headline number, pre-formatted by the caller (`12.9K`, `$4.2M`, `3.4 hrs`). */
  value: ReactNode;
  /** Signed change over the comparison period, as a ratio — `0.124` is a 12.4% rise. */
  delta?: number;
  /** Overrides the default signed-percentage rendering of `delta`. */
  formatDelta?: (delta: number) => string;
  /** Names the period the delta is measured against, e.g. `"vs. previous 30 days"`. */
  deltaLabel?: ReactNode;
  /** Which way is good news, deciding the delta's color. Defaults to `"up-is-good"`. */
  deltaDirection?: StatCardDeltaDirection;
  /** A short series rendered as a `Sparkline` under the value. Ten to fifteen points reads best. */
  trend?: number[];
  /** A leading icon for the metric. Decorative — it's hidden from assistive tech. */
  icon?: ReactNode;
}

/**
 * The "big number, and which way it's going" tile a dashboard overview is
 * built from — label, value, an optional signed delta, and an optional
 * `Sparkline`. Wraps `Card` rather than restyling a bare `div`, so a KPI row
 * and the cards around it share one surface, border, and shadow.
 *
 * The delta never leans on color alone (WCAG 1.4.1): an arrow icon carries
 * the direction visually, and an `sr-only` "increased"/"decreased" carries it
 * to assistive tech, so the green/red is reinforcement rather than the signal.
 * `deltaDirection` exists because "up" isn't universally good — active users
 * rising is good news, average response time rising isn't — and hard-coding
 * green-for-up would color half a real dashboard wrong.
 *
 * The value uses the font's default proportional figures, deliberately not
 * `tabular-nums`: tabular figures give every digit a `0`'s width, which reads
 * loose at display sizes. `Table`'s columns are where tabular figures belong.
 *
 * Scoped to presentation — no fetching, polling, or loading state of its own.
 * A caller showing one before its data arrives composes `Skeleton` in the
 * `value` slot, the same way `Skeleton`'s own docs describe.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      delta,
      formatDelta = formatDeltaAsPercent,
      deltaLabel,
      deltaDirection = "up-is-good",
      trend,
      icon,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const hasDelta = delta !== undefined;
    const isFlat = hasDelta && delta === 0;
    const isUp = hasDelta && delta > 0;

    const tone = !hasDelta || isFlat
      ? "neutral"
      : deltaDirection === "neutral"
        ? "neutral"
        : (deltaDirection === "up-is-good") === isUp
          ? "good"
          : "bad";

    const DeltaIcon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;
    const deltaDescription = isFlat ? "No change" : isUp ? "Increased by" : "Decreased by";

    return (
      <Card ref={ref} className={mergeClassNames("flex flex-col gap-3 p-5", className)} {...props}>
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
          {icon ? (
            <span aria-hidden="true" className="shrink-0 text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-3xl leading-none font-semibold tracking-tight text-slate-950 dark:text-white">
              {value}
            </span>
            {hasDelta ? (
              <span className={mergeClassNames("flex items-center gap-1 text-xs font-medium", deltaToneClassNames[tone])}>
                <DeltaIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {/* Carries the direction to assistive tech, which can't see
                    the arrow and mustn't be asked to infer it from the color. */}
                <span className="sr-only">{deltaDescription}</span>
                <span>{formatDelta(delta)}</span>
                {deltaLabel ? (
                  <span className="font-normal text-slate-500 dark:text-slate-400">{deltaLabel}</span>
                ) : null}
              </span>
            ) : null}
          </div>
          {trend && trend.length > 1 ? (
            <Sparkline
              data={trend}
              showEndPoint
              className={mergeClassNames("h-10 w-24 shrink-0", deltaToneClassNames[tone])}
            />
          ) : null}
        </div>

        {children}
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";
