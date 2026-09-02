import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { mergeClassNames } from "../../utils/mergeClassNames";

export type TableProps = HTMLAttributes<HTMLTableElement>;

/**
 * A data table. Renders a native `<table>` — row/column/header
 * associations, and a screen reader's table-navigation commands, all come
 * from the browser as a result, nothing about that reimplemented here.
 * Wrapped in a horizontally scrolling container, since a table's columns
 * don't reflow the way text wraps: on a narrow viewport, the wrapper
 * scrolls instead of the table overflowing the page. Compose it with
 * `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`,
 * `TableCell`, and `TableCaption`.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={mergeClassNames("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={mergeClassNames(
        "[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-800",
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={mergeClassNames("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  ),
);
TableBody.displayName = "TableBody";

export type TableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={mergeClassNames(
        "border-t border-slate-200 bg-slate-50 font-medium dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={mergeClassNames(
        "border-b border-slate-200 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

export type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;

/**
 * A column header cell. Defaults `scope="col"` — the native attribute
 * that lets assistive tech announce which column a data cell belongs to
 * when navigating the table — pass `scope="row"` yourself for a
 * row-header `<th>` instead.
 */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, scope = "col", ...props }, ref) => (
    <th
      ref={ref}
      scope={scope}
      className={mergeClassNames(
        "h-10 px-3 text-left align-middle font-medium text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={mergeClassNames("p-3 align-middle", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

/** The table's accessible description, rendered below the table (`caption-bottom` on `Table`) — the native, correct way to give a table a name/summary, the same reasoning `DialogTitle` gets for dialogs. */
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={mergeClassNames("mt-4 text-xs text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  ),
);
TableCaption.displayName = "TableCaption";
