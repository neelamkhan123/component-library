import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Table/Table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "../Pagination/Pagination";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

type SortDirection = "asc" | "desc";
type Align = "left" | "center" | "right";

export interface DataTableColumn<T> {
  /** Must be a key of `T` — read as the cell's value unless `cell` is given, and used as this column's React key. */
  key: keyof T & string;
  header: ReactNode;
  /** Custom cell content. Defaults to `String(row[key])`. */
  cell?: (row: T) => ReactNode;
  /** Enables click-to-sort on this column's header. */
  sortable?: boolean;
  /** Custom sort key, for columns whose displayed value isn't itself sortable (e.g. a formatted date). Defaults to `row[key]`. */
  sortValue?: (row: T) => string | number;
  align?: Align;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Identifies each row for React's `key` — defaults to its index, which is fine unless rows are reordered by sorting across a paginated boundary in a way that would matter for e.g. focus/animation state, which this component doesn't have anyway. */
  getRowId?: (row: T, index: number) => string | number;
  /** Rows per page. Omit to disable pagination and render every row. */
  pageSize?: number;
  emptyMessage?: ReactNode;
}

const alignClassNames: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * A sortable, optionally paginated table driven by a `columns`/`data`
 * pair. Built *on* `Table` (for markup and styling) and `Pagination` (for
 * page controls) rather than reinventing either — the same "compose what
 * already exists" instinct behind `DropdownMenu` building on `ContextMenu`.
 *
 * Deliberately scoped: no filtering, global search, row selection, or
 * column resizing/reordering. A fully-featured data grid is a genuinely
 * different, much larger component — most component libraries that ship
 * one either depend on a headless table library (TanStack Table, the
 * approach shadcn/ui's own docs recommend rather than shipping a built-in
 * data table at all) or accept a similarly bounded scope to this one. This
 * library has taken on no new dependencies for any other component, and
 * sorting plus pagination are the two features that cover the large
 * majority of "I just want a nicer table" needs — see `DECISIONS.md`.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  pageSize,
  emptyMessage = "No results.",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return data;
    const getValue = column.sortValue ?? ((row: T) => row[column.key] as unknown as string | number);
    const sorted = [...data].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const comparison =
        typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [data, sort, columns]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const clampedPage = Math.min(currentPage, totalPages);
  const pageData = pageSize
    ? sortedData.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
    : sortedData;

  // Three-state cycle: unsorted -> ascending -> descending -> unsorted.
  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              return (
                <TableHead
                  key={column.key}
                  aria-sort={
                    isSorted
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : column.sortable
                        ? "none"
                        : undefined
                  }
                  className={mergeClassNames(alignClassNames[column.align ?? "left"], column.className)}
                >
                  {column.sortable ? (
                    // A button inside the <th>, not the <th> itself made
                    // clickable — the same interactive-element-inside
                    // approach `ContextMenuItem`/`AccordionTrigger` use,
                    // since a <th> isn't natively interactive on its own.
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={mergeClassNames(
                        "inline-flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-400 dark:hover:text-white dark:focus-visible:outline-white",
                        column.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {column.header}
                      {isSorted ? (
                        sort.direction === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((row, index) => (
              <TableRow key={getRowId ? getRowId(row, index) : index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={mergeClassNames(alignClassNames[column.align ?? "left"], column.className)}
                  >
                    {column.cell ? column.cell(row) : String(row[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pageSize && totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={clampedPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              />
            </PaginationItem>
            {getPaginationRange({ currentPage: clampedPage, totalPages }).map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink isActive={item === clampedPage} onClick={() => setCurrentPage(item)}>
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                disabled={clampedPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
