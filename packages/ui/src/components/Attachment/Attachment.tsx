import { forwardRef, type HTMLAttributes } from "react";
import { File, X } from "lucide-react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export interface AttachmentProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The file's name — shown in the file row, and used as the image's `alt` text for an image attachment. */
  name: string;
  /** A human-readable size, e.g. `"2.4 MB"`. */
  size?: string;
  /**
   * Where the file lives. Given a `url`, the attachment becomes a real
   * link: `target="_blank"` for an image, `download` for a file. Browsers
   * only honor `download` for same-origin URLs (or ones a CORS response
   * explicitly permits) — see `DECISIONS.md`.
   */
  url?: string;
  /** Renders an image preview instead of the generic file row. Defaults to `"file"`. */
  type?: "image" | "file";
  /**
   * Shows a remove button and calls this when it's clicked. Meant for a
   * file staged in a composer before it's sent, not one already posted in
   * a message — supplying it also switches an image attachment from the
   * full-size linked photo to a small captioned thumbnail, since a
   * pending upload isn't something to click through to yet.
   */
  onRemove?: () => void;
  /** Accessible label for the remove button. Defaults to `"Remove {name}"`. */
  removeLabel?: string;
}

/**
 * A file or image attached to a message. When `url` is given, the actual
 * clickable/downloadable element is a real `<a>` inside this component —
 * not a `<div>` with a click handler bolted on — so the outer element
 * (what this forwards its ref to) stays a plain `<div>` regardless of
 * whether that inner link is present, rather than the ref's type
 * depending on a prop's value.
 */
export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(
  ({ name, size, url, type = "file", onRemove, removeLabel, className, ...props }, ref) => {
    const removeButton = onRemove ? (
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel ?? `Remove ${name}`}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    ) : null;

    if (type === "image" && url) {
      // A pending upload gets a small captioned thumbnail with a remove
      // button; an already-posted image stays the full-size linked photo
      // it's always been — see the `onRemove` doc above for why the two
      // differ.
      if (onRemove) {
        return (
          <div ref={ref} className={mergeClassNames("w-28", className)} {...props}>
            <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <img src={url} alt={name} className="block h-28 w-28 object-cover" />
              <div className="absolute top-1 right-1 rounded-full bg-white/90 dark:bg-slate-950/90">
                {removeButton}
              </div>
            </div>
            <div className="mt-1.5 min-w-0">
              <p className="truncate text-xs font-medium text-slate-950 dark:text-white">{name}</p>
              {size ? <p className="truncate text-xs text-slate-500 dark:text-slate-400">{size}</p> : null}
            </div>
          </div>
        );
      }

      return (
        <div
          ref={ref}
          className={mergeClassNames(
            "w-fit overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800",
            className,
          )}
          {...props}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img src={url} alt={name} className="block max-h-64 max-w-64 object-cover" />
          </a>
        </div>
      );
    }

    const content = (
      <>
        <File className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-slate-950 dark:text-white">{name}</span>
          {size ? <span className="text-xs text-slate-500 dark:text-slate-400">{size}</span> : null}
        </span>
      </>
    );

    return (
      <div
        ref={ref}
        className={mergeClassNames(
          "flex w-fit max-w-64 items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
          className,
        )}
        {...props}
      >
        {url ? (
          <a
            href={url}
            download={name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            {content}
          </a>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-sm">{content}</div>
        )}
        {removeButton ? <div className="mr-2 shrink-0">{removeButton}</div> : null}
      </div>
    );
  },
);
Attachment.displayName = "Attachment";
