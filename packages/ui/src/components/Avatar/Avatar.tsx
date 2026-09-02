import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ForwardedRef,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClassNames } from "../../utils/mergeClassNames";

function assignRef<T>(ref: ForwardedRef<T>, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

type ImageStatus = "idle" | "loading" | "loaded" | "error";

interface AvatarImageState {
  /**
   * The `src` this status describes. A status recorded for one `src` says
   * nothing about a different one, so the two always travel together.
   */
  src: string | undefined;
  status: ImageStatus;
}

const IDLE_IMAGE_STATE: AvatarImageState = { src: undefined, status: "idle" };

interface AvatarContextValue {
  imageState: AvatarImageState;
  setImageState: Dispatch<SetStateAction<AvatarImageState>>;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatarContext(component: string): AvatarContextValue {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error(`<${component} /> must be rendered inside an <Avatar>.`);
  }
  return context;
}

const avatarVariants = cva(
  "relative inline-flex shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface AvatarProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {}

/**
 * A round image placeholder for a user or entity. Compose it with
 * `AvatarImage` and `AvatarFallback` — the fallback (initials, an icon, …)
 * is shown until the image has actually finished loading, and again if it
 * fails to load, so there's never a broken-image icon or empty circle.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, children, ...props }, ref) => {
    const [imageState, setImageState] = useState<AvatarImageState>(IDLE_IMAGE_STATE);
    const context = useMemo(() => ({ imageState, setImageState }), [imageState]);
    return (
      <AvatarContext.Provider value={context}>
        <span
          ref={ref}
          className={mergeClassNames(avatarVariants({ size }), className)}
          {...props}
        >
          {children}
        </span>
      </AvatarContext.Provider>
    );
  },
);
Avatar.displayName = "Avatar";

export interface AvatarImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  /** Required — an avatar image conveys who or what it represents, so it needs a text alternative. */
  alt: string;
}

/**
 * The avatar's image. Tracks its own load state so `AvatarFallback` knows
 * when to give way to it — mount this unconditionally (even with a `src`
 * you're not sure will resolve) and the fallback handles the rest.
 *
 * Renders nothing when there's no `src` or the image failed to load, so the
 * browser's broken-image glyph can never show through the fallback.
 */
export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoad, onError, src, ...props }, ref) => {
    const { imageState, setImageState } = useAvatarContext("AvatarImage");

    // A status belongs to the `src` it was recorded for; anything else is
    // still in flight, which is what keeps a previous src's "error" from
    // suppressing the <img> for the new one.
    const status = imageState.src === src ? imageState.status : "loading";

    const record = useCallback(
      (next: AvatarImageState) =>
        setImageState((previous) =>
          previous.src === next.src && previous.status === next.status
            ? previous
            : next,
        ),
      [setImageState],
    );

    // Read the element's own state as React attaches it instead of reporting
    // "loading" from an effect: effects flush after paint, so a cached image
    // can fire `load` first and a late reset would then strand the fallback
    // on top of an image that had already arrived. Re-keying on `src` makes
    // React re-run this whenever the requested image changes.
    const attachImage = useCallback(
      (node: HTMLImageElement | null) => {
        assignRef(ref, node);
        if (!node || !src) return;
        if (!node.complete) {
          record({ src, status: "loading" });
        } else {
          record({ src, status: node.naturalWidth > 0 ? "loaded" : "error" });
        }
      },
      [ref, src, record],
    );

    // With no `src` there's no <img> to report back, so record idle here.
    useEffect(() => {
      if (!src) record(IDLE_IMAGE_STATE);
    }, [src, record]);

    // An <img> with a broken (or absent) src still paints the browser's
    // broken-image icon and alt text, which would sit behind the fallback's
    // initials. Unmount it instead and leave the circle to the fallback.
    if (!src || status === "error") return null;

    return (
      <img
        ref={attachImage}
        src={src}
        onLoad={(event) => {
          onLoad?.(event);
          record({ src, status: "loaded" });
        }}
        onError={(event) => {
          onError?.(event);
          record({ src, status: "error" });
        }}
        className={mergeClassNames(
          "absolute inset-0 h-full w-full object-cover",
          className,
        )}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Delays rendering the fallback by this many milliseconds, so a
   * fast-loading image never flashes initials before replacing them.
   * Omit to render the fallback immediately.
   */
  delayMs?: number;
}

/**
 * What's shown in place of `AvatarImage` — typically initials or an icon —
 * while there's no image, it's still loading, or it failed to load.
 */
export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, delayMs, ...props }, ref) => {
    const { imageState } = useAvatarContext("AvatarFallback");
    const [delayElapsed, setDelayElapsed] = useState(delayMs === undefined);

    useEffect(() => {
      if (delayMs === undefined) return;
      setDelayElapsed(false);
      const timer = setTimeout(() => setDelayElapsed(true), delayMs);
      return () => clearTimeout(timer);
    }, [delayMs]);

    if (imageState.status === "loaded" || !delayElapsed) return null;

    return (
      <span
        ref={ref}
        className={mergeClassNames(
          // Opaque, not a transparent overlay: it sits above the <img>, so a
          // see-through fallback would composite its initials on top of an
          // image that is mid-load rather than standing in for it.
          "absolute inset-0 flex items-center justify-center bg-slate-100 font-medium uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          className,
        )}
        {...props}
      />
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";
