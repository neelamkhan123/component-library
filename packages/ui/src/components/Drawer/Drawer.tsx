import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialog,
  useDialogPanel,
  type DialogProps,
} from "../Dialog/Dialog";
import { X } from "lucide-react";
import { mergeClassNames } from "../../utils/mergeClassNames";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

export type DrawerProps = DialogProps;

/**
 * A panel that slides in from an edge of the screen, built on the same
 * native `<dialog>` foundation as `Dialog` (so focus trapping, Escape-to-
 * close, and top-layer stacking all come from the browser). Compose it with
 * `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`,
 * `DrawerDescription`, `DrawerFooter`, and `DrawerClose`. `DrawerContent`
 * must contain a `DrawerTitle` so the drawer has an accessible name.
 */
export function Drawer(props: DrawerProps) {
  return <Dialog {...props} />;
}

// A drawer is a Dialog with different Content styling — everything about
// opening, closing, and labeling is identical, so these are the exact same
// components under new, drawer-flavored names.
export const DrawerTrigger = DialogTrigger;
export const DrawerClose = DialogClose;
export const DrawerHeader = DialogHeader;
export const DrawerTitle = DialogTitle;
export const DrawerDescription = DialogDescription;
export const DrawerFooter = DialogFooter;
export const useDrawer = useDialog;

const drawerContentVariants = cva(
  [
    // `m-0` overrides the `<dialog>` UA default of `margin: auto`. Left in
    // place, that default margin fights the explicit `inset`/`h-dvh`/`w-full`
    // sizing below: with top+height+bottom (or left+width+right) all
    // non-auto, the browser resolves the over-constrained system by
    // splitting the leftover space into equal auto margins, which
    // shrinks-and-centers the panel instead of pinning it flush to the edge.
    "fixed max-h-none max-w-none m-0 bg-white p-6 text-slate-950",
    "shadow-[rgba(0,0,0,0.05)_0px_6px_24px_0px,_rgba(0,0,0,0.08)_0px_0px_0px_1px]",
    "dark:bg-slate-950 dark:text-white",
    // Slide the panel in on open and back out on close. `open:` targets
    // `[open]`, `starting:` is the `@starting-style` entry state, and
    // `transition-discrete` (allow-discrete) is what lets the browser keep
    // the drawer rendered in the top layer for the exit transition instead
    // of yanking `display` the instant `close()` is called. `motion-reduce:`
    // drops the transition entirely for prefers-reduced-motion (WCAG 2.3.3).
    "transition-[translate,overlay,display] transition-discrete duration-300 ease-out motion-reduce:transition-none",
    // Same fade the Dialog backdrop uses.
    "backdrop:bg-slate-950/50 backdrop:opacity-0 backdrop:backdrop-blur-xs",
    "backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-200 backdrop:ease-out",
    "open:backdrop:opacity-100 starting:open:backdrop:opacity-0 backdrop:motion-reduce:transition-none",
    "dark:backdrop:bg-black/70",
  ].join(" "),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 bottom-auto w-full max-h-[80vh] -translate-y-full open:translate-y-0 starting:open:-translate-y-full",
        right:
          "inset-y-0 right-0 left-auto h-dvh w-full max-w-sm translate-x-full open:translate-x-0 starting:open:translate-x-full",
        bottom:
          "inset-x-0 bottom-0 top-auto w-full max-h-[80vh] translate-y-full open:translate-y-0 starting:open:translate-y-full",
        left: "inset-y-0 left-0 right-auto h-dvh w-full max-w-sm -translate-x-full open:translate-x-0 starting:open:-translate-x-full",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface DrawerContentProps
  extends
    Omit<HTMLAttributes<HTMLDialogElement>, "onClose">,
    VariantProps<typeof drawerContentVariants> {
  /** Closes the drawer when the area outside it (the backdrop) is clicked. Defaults to `true`. */
  closeOnOutsideClick?: boolean;
  /** Hides the built-in close button in the corner. Defaults to `false`. */
  hideCloseButton?: boolean;
  onClose?: (event: React.SyntheticEvent<HTMLDialogElement>) => void;
}

/**
 * The drawer panel itself, rendered as a native `<dialog>` pinned to one
 * edge of the viewport. `side` chooses which edge it slides in from —
 * `"top"`, `"right"` (the default), `"bottom"`, or `"left"`.
 */
export const DrawerContent = forwardRef<HTMLDialogElement, DrawerContentProps>(
  (
    {
      className,
      side = "right",
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
        className={mergeClassNames(drawerContentVariants({ side }), className)}
        {...props}
      >
        {children}
        {hideCloseButton ? null : (
          <DrawerClose
            className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DrawerClose>
        )}
      </dialog>
    );
  },
);
DrawerContent.displayName = "DrawerContent";
