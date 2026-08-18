import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { X } from "lucide-react";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentRef: RefObject<HTMLDialogElement | null>;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside a <Dialog>.`);
  }
  return context;
}

/**
 * Reads the current open state and exposes a setter, for wiring up a
 * custom trigger or close control (e.g. a `Button`) that DialogTrigger
 * and DialogClose don't already cover.
 */
export function useDialog(): Pick<DialogContextValue, "open" | "onOpenChange"> {
  const { open, onOpenChange } = useDialogContext("useDialog()");
  return { open, onOpenChange };
}

interface DialogPanelOptions {
  closeOnOutsideClick: boolean;
  onClose?: (event: React.SyntheticEvent<HTMLDialogElement>) => void;
  onClick?: React.MouseEventHandler<HTMLDialogElement>;
}

/**
 * Wires up a native `<dialog>` to the Dialog context: shows/hides it via
 * `showModal()`/`close()` as the open state changes, locks background
 * scroll while open, and treats the native `close` event as the single
 * source of truth for syncing state back. Shared by `DialogContent` and
 * `Drawer`'s `DrawerContent`, which render their own panel markup on top of
 * the same native `<dialog>` plumbing.
 */
export function useDialogPanel({
  closeOnOutsideClick,
  onClose,
  onClick,
}: DialogPanelOptions) {
  const { open, onOpenChange, contentRef, titleId, descriptionId } =
    useDialogContext("DialogContent");

  useEffect(() => {
    const dialogEl = contentRef.current;
    if (!dialogEl) return;
    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  }, [open, contentRef]);

  // Prevent the page from scrolling behind the modal while it's open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return {
    contentRef,
    titleId,
    descriptionId,
    handleClose: (event: React.SyntheticEvent<HTMLDialogElement>) => {
      onClose?.(event);
      // Syncs state when the dialog is closed natively (Escape key).
      onOpenChange(false);
    },
    handleClick: (event: React.MouseEvent<HTMLDialogElement>) => {
      onClick?.(event);
      if (closeOnOutsideClick && event.target === contentRef.current) {
        contentRef.current?.close();
      }
    },
  };
}

export interface DialogProps {
  /** Controls the open state. Omit to let the dialog manage its own state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /**
   * Called whenever the open state changes, whether from `DialogTrigger`,
   * `DialogClose`, the built-in close button, Escape, or an outside click.
   */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * A modal dialog built on the native `<dialog>` element, so focus trapping,
 * Escape-to-close, and top-layer stacking come from the browser instead of
 * being hand-rolled. Compose it with `DialogTrigger`, `DialogContent`,
 * `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, and
 * `DialogClose`. `DialogContent` must contain a `DialogTitle` so the dialog
 * has an accessible name.
 */
export function Dialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const contentRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        contentRef,
        titleId,
        descriptionId,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export type DialogTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Opens the dialog when clicked. Renders a native `<button>`. */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, type = "button", ...props }, ref) => {
    const { onOpenChange } = useDialogContext("DialogTrigger");
    return (
      <button
        ref={ref}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) onOpenChange(true);
        }}
        {...props}
      />
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

export interface DialogContentProps extends Omit<
  HTMLAttributes<HTMLDialogElement>,
  "onClose"
> {
  /** Closes the dialog when the area outside it (the backdrop) is clicked. Defaults to `true`. */
  closeOnOutsideClick?: boolean;
  /** Hides the built-in close button in the top-right corner. Defaults to `false`. */
  hideCloseButton?: boolean;
  onClose?: (event: React.SyntheticEvent<HTMLDialogElement>) => void;
}

/**
 * The dialog panel itself, rendered as a native `<dialog>`. Mounts once and
 * is shown/hidden via `showModal()`/`close()` as the open state changes, so
 * focus is trapped and returned to the trigger automatically.
 */
export const DialogContent = forwardRef<HTMLDialogElement, DialogContentProps>(
  (
    {
      className,
      closeOnOutsideClick = true,
      hideCloseButton = false,
      onClick,
      onClose,
      children,
      ...props
    },
    ref,
  ) => {
    const { contentRef, titleId, descriptionId, handleClose, handleClick } =
      useDialogPanel({ closeOnOutsideClick, onClose, onClick });

    return (
      <dialog
        ref={mergeRefs(contentRef, ref)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={handleClose}
        onClick={handleClick}
        className={mergeClassNames(
          // Base panel look.
          "m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px] dark:border-slate-800 dark:bg-slate-950 dark:text-white",
          // Fade + scale the panel in on open and back out on close. `open:` targets
          // `[open]`, `starting:` is the `@starting-style` entry state, and
          // `transition-discrete` (allow-discrete) is what lets the browser keep the
          // dialog rendered in the top layer for the exit transition instead of
          // yanking `display` the instant `close()` is called. `motion-reduce:`
          // drops the transition entirely for prefers-reduced-motion (WCAG 2.3.3).
          "scale-95 opacity-0 transition-[opacity,scale,overlay,display] transition-discrete duration-200 ease-out open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0 motion-reduce:transition-none",
          // Same fade, applied to the backdrop.
          "backdrop:bg-slate-950/50 backdrop:opacity-0 backdrop:backdrop-blur-xs backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-100 backdrop:ease-out open:backdrop:opacity-100 starting:open:backdrop:opacity-0 backdrop:motion-reduce:transition-none dark:backdrop:bg-black/70",
          className,
        )}
        {...props}
      >
        {children}
        {hideCloseButton ? null : (
          <DialogClose
            className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:outline-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogClose>
        )}
      </dialog>
    );
  },
);
DialogContent.displayName = "DialogContent";

export type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames("flex flex-col gap-1.5 pr-6", className)}
      {...props}
    />
  ),
);
DialogHeader.displayName = "DialogHeader";

export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

/** The dialog's accessible name. Required — `DialogContent` links to it via `aria-labelledby`. */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, id, ...props }, ref) => {
    const { titleId } = useDialogContext("DialogTitle");
    return (
      <h2
        ref={ref}
        id={id ?? titleId}
        className={mergeClassNames(
          "text-lg leading-none font-semibold tracking-tight",
          className,
        )}
        {...props}
      />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, id, ...props }, ref) => {
  const { descriptionId } = useDialogContext("DialogDescription");
  return (
    <p
      ref={ref}
      id={id ?? descriptionId}
      className={mergeClassNames(
        "text-sm text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassNames(
        "flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";

export type DialogCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Closes the dialog when clicked. Renders an unstyled native `<button>`. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, type = "button", ...props }, ref) => {
    const { onOpenChange, contentRef } = useDialogContext("DialogClose");
    return (
      <button
        ref={ref}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (contentRef.current) contentRef.current.close();
          else onOpenChange(false);
        }}
        {...props}
      />
    );
  },
);
DialogClose.displayName = "DialogClose";
