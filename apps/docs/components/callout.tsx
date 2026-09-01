import type { ReactNode } from "react";
import { AlertTriangle, CircleAlert, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  note: {
    Icon: Info,
    className: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50",
    iconClassName: "text-slate-500 dark:text-slate-400",
  },
  tip: {
    Icon: Lightbulb,
    className: "border-accent-200 bg-accent-50 dark:border-accent-900 dark:bg-accent-950/40",
    iconClassName: "text-accent-600 dark:text-accent-400",
  },
  warning: {
    Icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    Icon: CircleAlert,
    className: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    iconClassName: "text-red-600 dark:text-red-400",
  },
} as const;

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof variants;
  title?: string;
  children: ReactNode;
}) {
  const { Icon, className, iconClassName } = variants[variant];

  return (
    <div className={cn("my-6 flex gap-3 rounded-xl border p-4", className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClassName)} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm [&>p]:my-0 [&>p+p]:mt-2">
        {title ? <p className="mb-1 font-semibold">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
