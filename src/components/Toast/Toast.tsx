import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function mergeClassNames(
  ...classNames: Array<string | undefined | false>
): string {
  return classNames.filter(Boolean).join(" ");
}

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastOptions {
  /**
   * Reuse an id (e.g. from a previous `toast()` call's return value) to
   * update that toast in place — resetting its timer and content — rather
   * than stacking a new one. Useful for a "Loading…" → "Done!" toast that
   * stays a single notification throughout.
   */
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismissing. `Infinity` requires manual dismissal. Defaults to `5000`. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastRecord extends ToastOptions {
  id: string;
  duration: number;
  closing: boolean;
}

// A module-level store, not React state: `toast()` has to be callable from
// anywhere — a click handler, a promise's `.catch()`, code with no
// component above it at all — which plain `useState`/context can't support
// (there's no guaranteed component in the tree to own that state). `Toaster`
// subscribes to this the same way any external store is meant to be read
// from React: `useSyncExternalStore`, not a home-grown re-render hack.
let toasts: ToastRecord[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let nextId = 0;

// Must match the exit transition's `duration-*` class on ToastItem below —
// there's no single source of truth linking a Tailwind class to this
// constant, so keep them in sync by hand if either changes.
const EXIT_DURATION_MS = 200;

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ToastRecord[] {
  return toasts;
}

function clearTimer(id: string) {
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function scheduleDismiss(id: string, duration: number) {
  clearTimer(id);
  if (!Number.isFinite(duration)) return;
  timers.set(
    id,
    setTimeout(() => dismissToast(id), duration),
  );
}

function dismissToast(id: string) {
  clearTimer(id);
  const record = toasts.find((t) => t.id === id);
  if (!record || record.closing) return;
  toasts = toasts.map((t) => (t.id === id ? { ...t, closing: true } : t));
  notify();
  // No native discrete-property toggle to hook into here (unlike `<dialog>`'s
  // `close` event or a popover's `toggle`), since a toast is a plain array
  // entry with no browser-native open/closed state of its own — so removal
  // is the classic two-phase technique instead: flag it closing, let the
  // CSS transition play, then actually drop it from the array once that's
  // had time to finish.
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, EXIT_DURATION_MS);
}

/**
 * Shows a toast. Pass a string for just a title, or an options object for
 * a description, variant, action, custom duration, or an `id` to update an
 * existing toast in place. Returns the toast's id (pass it to
 * `toast.dismiss()` or a later `toast()` call to update it).
 */
export function toast(
  titleOrOptions: string | ToastOptions,
  moreOptions?: Omit<ToastOptions, "title">,
): string {
  const options: ToastOptions =
    typeof titleOrOptions === "string"
      ? { ...moreOptions, title: titleOrOptions }
      : titleOrOptions;
  const id = options.id ?? `toast-${++nextId}`;
  const duration = options.duration ?? 5000;

  const exists = toasts.some((t) => t.id === id);
  const record: ToastRecord = { ...options, id, duration, closing: false };
  toasts = exists
    ? toasts.map((t) => (t.id === id ? record : t))
    : [...toasts, record];
  notify();
  scheduleDismiss(id, duration);
  return id;
}

/** Dismisses one toast by id, or every currently-shown toast if omitted. */
toast.dismiss = function dismiss(id?: string) {
  if (id) dismissToast(id);
  else for (const t of toasts) dismissToast(t.id);
};

function useToasts(): ToastRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const variantClassNames: Record<ToastVariant, string> = {
  default:
    "border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white",
  destructive:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
};

function ToastItem({ record }: { record: ToastRecord }) {
  const { id, title, description, action, closing, duration } = record;
  const variant = record.variant ?? "default";

  return (
    <div
      // `destructive` gets the more interruptive `alert` (implicit
      // `aria-live="assertive"`); everything else gets the calmer `status`
      // (implicit `aria-live="polite"`) — no explicit `aria-live` needed on
      // top of either, since both roles already imply it. Inserting this
      // element into the DOM is itself what gets it announced; nothing
      // else here manually triggers that.
      role={variant === "destructive" ? "alert" : "status"}
      onMouseEnter={() => clearTimer(id)}
      onMouseLeave={() => scheduleDismiss(id, duration)}
      className={mergeClassNames(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] transition-[opacity,translate] duration-200 motion-reduce:transition-none",
        "starting:translate-y-2 starting:opacity-0",
        closing ? "opacity-0" : "translate-y-0 opacity-100",
        variantClassNames[variant],
      )}
    >
      <div className="flex-1 space-y-1">
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        {description ? (
          <p className="text-sm opacity-80">{description}</p>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              dismissToast(id);
            }}
            className="text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(id)}
        aria-label="Dismiss"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const positionClassNames: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4 flex-col-reverse items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 flex-col-reverse items-center",
  "top-right": "top-4 right-4 flex-col-reverse items-end",
  "bottom-left": "bottom-4 left-4 flex-col items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 flex-col items-center",
  "bottom-right": "bottom-4 right-4 flex-col items-end",
};

export interface ToasterProps {
  /** Defaults to `"bottom-right"`. */
  position?: ToastPosition;
}

/**
 * Renders the current stack of toasts. Mount this once, near the root of
 * your app — every `toast()` call anywhere renders into whichever
 * `<Toaster />` is mounted. Portals into `document.body` (this is the one
 * component in this library that does): unlike `Dialog`'s `<dialog>` or
 * `ContextMenu`/`Select`'s `popover`, there's no native top-layer
 * primitive for a passive, non-modal notification stack, so escaping an
 * ancestor's `overflow`/`z-index`/`transform` takes an actual portal
 * instead of a platform feature doing it for free.
 *
 * New toasts are always appended to the end of the underlying list;
 * `flex-col-reverse` for the top positions (vs. plain `flex-col` for the
 * bottom ones) is what keeps "newest toast nearest the edge it's anchored
 * to" true for both, without needing to reverse that list itself.
 */
export function Toaster({ position = "bottom-right" }: ToasterProps) {
  const records = useToasts();
  // `createPortal` needs `document`, which doesn't exist during server
  // rendering — deferring to an effect (which only ever runs client-side)
  // is the standard way to make a portal SSR-safe. No other component in
  // this library needs this, since none of them touch `document` during
  // render itself, only inside effects.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className={mergeClassNames(
        "pointer-events-none fixed z-50 flex w-full max-w-sm gap-2 p-4",
        positionClassNames[position],
      )}
    >
      {records.map((record) => (
        <ToastItem key={record.id} record={record} />
      ))}
    </div>,
    document.body,
  );
}
