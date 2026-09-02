import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactEventHandler,
  type Ref,
} from "react";
import { type VariantProps } from "class-variance-authority";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialog,
  useDialogPanel,
  type DialogProps,
} from "../Dialog/Dialog";
import { buttonVariants } from "../Button/Button";
import { mergeClassNames } from "../../utils/mergeClassNames";

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

export type AlertDialogProps = DialogProps;

/**
 * A confirmation dialog for a choice that shouldn't be dismissible by
 * accident — built on the same native `<dialog>` foundation as `Dialog`
 * (focus trapping, top-layer stacking all still come from the browser),
 * but with both of `Dialog`'s dismiss paths that don't represent an
 * explicit choice switched off: no backdrop click, no Escape. `AlertDialog`,
 * `AlertDialogTrigger`, `AlertDialogHeader`, `AlertDialogTitle`,
 * `AlertDialogDescription`, and `AlertDialogFooter` are the exact same
 * components as their `Dialog` counterparts, re-exported under
 * alertdialog-flavored names — the same relationship (and the same reason)
 * `Drawer` has to `Dialog`. Only `AlertDialogContent`, `AlertDialogAction`,
 * and `AlertDialogCancel` are genuinely new.
 */
export function AlertDialog(props: AlertDialogProps) {
  return <Dialog {...props} />;
}

export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;
export const useAlertDialog = useDialog;

export interface AlertDialogContentProps extends Omit<HTMLAttributes<HTMLDialogElement>, "onClose"> {
  onCancel?: ReactEventHandler<HTMLDialogElement>;
}

/**
 * The dialog panel, `role="alertdialog"` instead of the `<dialog>`
 * element's own implicit `dialog` role — the WAI-ARIA Alert Dialog pattern,
 * which exists specifically to mark a dialog as one assistive tech should
 * treat as requiring an immediate, explicit response.
 *
 * `closeOnOutsideClick` isn't offered here as a prop the way it is on
 * `DialogContent` — it's simply never true, always, since a stray click
 * silently discarding a destructive confirmation is exactly what this
 * component exists to prevent. Escape is blocked the same deliberate way:
 * a native `<dialog>` fires a cancelable `cancel` event before Escape
 * closes it, so `onCancel` calls `preventDefault()` on it, stopping the
 * close before it starts rather than closing and then trying to reopen.
 * There's also no built-in corner close button — every dismissal here
 * should read as a deliberate choice between `AlertDialogAction` and
 * `AlertDialogCancel`, not a third, easier-to-misclick escape hatch.
 */
export const AlertDialogContent = forwardRef<HTMLDialogElement, AlertDialogContentProps>(
  ({ className, onCancel, onClick, children, ...props }, ref) => {
    const { contentRef, titleId, descriptionId, handleClose, handleClick } = useDialogPanel({
      closeOnOutsideClick: false,
      onClick,
    });

    return (
      <dialog
        ref={mergeRefs(contentRef, ref)}
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={handleClose}
        onClick={handleClick}
        onCancel={(event) => {
          onCancel?.(event);
          if (!event.defaultPrevented) event.preventDefault();
        }}
        className={mergeClassNames(
          // Identical look-and-feel to DialogContent — an alert dialog
          // isn't visually distinct from a regular one, only behaviorally.
          "m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:border-slate-800 dark:bg-slate-950 dark:text-white",
          "scale-95 opacity-0 transition-[opacity,scale,overlay,display] transition-discrete duration-200 ease-out open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0 motion-reduce:transition-none",
          "backdrop:bg-slate-950/50 backdrop:opacity-0 backdrop:backdrop-blur-xs backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-100 backdrop:ease-out open:backdrop:opacity-100 starting:open:backdrop:opacity-0 backdrop:motion-reduce:transition-none dark:backdrop:bg-black/70",
          className,
        )}
        {...props}
      >
        {children}
      </dialog>
    );
  },
);
AlertDialogContent.displayName = "AlertDialogContent";

export interface AlertDialogActionProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Confirms and closes. Styled with `Button`'s own `variant`/`size` system
 * (`variant` defaults to `"default"`) rather than left unstyled the way
 * `DialogClose` is — unlike a plain close button, this always represents
 * the dialog's one deliberate way forward, so it always looks like a real
 * button, not something a caller has to remember to style themselves.
 * `<AlertDialogAction variant="destructive">Delete</AlertDialogAction>` is
 * the whole affordance for a destructive confirmation.
 */
export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ variant, size, className, onClick, type = "button", ...props }, ref) => {
    const { onOpenChange } = useAlertDialog();
    return (
      <button
        ref={ref}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onOpenChange(false);
        }}
        className={mergeClassNames(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
AlertDialogAction.displayName = "AlertDialogAction";

export interface AlertDialogCancelProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/** The explicit way out. Identical to `AlertDialogAction` except `variant` defaults to `"outline"`, so the two read as primary/secondary at a glance without either needing an explicit `variant`. */
export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ variant = "outline", size, className, onClick, type = "button", ...props }, ref) => {
    const { onOpenChange } = useAlertDialog();
    return (
      <button
        ref={ref}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onOpenChange(false);
        }}
        className={mergeClassNames(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
AlertDialogCancel.displayName = "AlertDialogCancel";
