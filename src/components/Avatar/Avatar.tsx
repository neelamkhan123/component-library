import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

type ImageStatus = "idle" | "loading" | "loaded" | "error";

interface AvatarContextValue {
  imageStatus: ImageStatus;
  setImageStatus: (status: ImageStatus) => void;
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
    const [imageStatus, setImageStatus] = useState<ImageStatus>("idle");
    return (
      <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
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
 */
export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoad, onError, src, ...props }, ref) => {
    const { setImageStatus } = useAvatarContext("AvatarImage");

    // Reset to "loading" whenever the image being requested changes, rather
    // than leaving the previous src's status (e.g. "error") applied to the
    // new one while it's still in flight.
    useEffect(() => {
      setImageStatus(src ? "loading" : "idle");
    }, [src, setImageStatus]);

    return (
      <img
        ref={ref}
        src={src}
        onLoad={(event) => {
          onLoad?.(event);
          setImageStatus("loaded");
        }}
        onError={(event) => {
          onError?.(event);
          setImageStatus("error");
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
    const { imageStatus } = useAvatarContext("AvatarFallback");
    const [delayElapsed, setDelayElapsed] = useState(delayMs === undefined);

    useEffect(() => {
      if (delayMs === undefined) return;
      setDelayElapsed(false);
      const timer = setTimeout(() => setDelayElapsed(true), delayMs);
      return () => clearTimeout(timer);
    }, [delayMs]);

    if (imageStatus === "loaded" || !delayElapsed) return null;

    return (
      <span
        ref={ref}
        className={mergeClassNames(
          "absolute inset-0 flex items-center justify-center font-medium uppercase text-slate-600 dark:text-slate-300",
          className,
        )}
        {...props}
      />
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";
