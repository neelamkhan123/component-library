import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { Input } from "../Input/Input";
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
import { mergeClassNames } from "../../utils/mergeClassNames";

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
  /**
   * The text this column contributes to the filter. Defaults to
   * `String(row[key])` — set it for columns whose `cell` renders something
   * the raw value doesn't describe (an avatar, a status badge), or pass
   * `() => ""` to exclude the column from filtering entirely.
   */
  filterValue?: (row: T) => string;
  align?: Align;
  className?: string;
}

/** What `onPaginationChange` reports — everything a caller needs to render
 *  its own pagination footer in place of DataTable's built-in one. */
export interface DataTablePaginationState {
  /** The current page, 1-indexed and already clamped to a valid range. */
  page: number;
  totalPages: number;
  /** Turns the page — the same setter the built-in footer's own buttons call. */
  setPage: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Identifies each row for React's `key` — defaults to its index, which is fine unless rows are reordered by sorting across a paginated boundary in a way that would matter for e.g. focus/animation state, which this component doesn't have anyway. */
  getRowId?: (row: T, index: number) => string | number;
  /** Rows per page. Omit to disable pagination and render every row. */
  pageSize?: number;
  emptyMessage?: ReactNode;
  /** Shows a search box above the table that filters rows across every column. */
  filterable?: boolean;
  /** The search box's accessible name. Defaults to `"Filter rows"`. */
  filterLabel?: string;
  filterPlaceholder?: string;
  /** Shown in place of `emptyMessage` when a filter is what emptied the table. */
  noMatchesMessage?: ReactNode;
  /**
   * Suppresses the built-in pagination footer while `pageSize` still pages
   * the rows internally exactly as before — pair with `onPaginationChange`
   * to render an equivalent footer somewhere else, e.g. outside a card
   * DataTable itself renders inside. Has no effect without `pageSize`.
   */
  hidePagination?: boolean;
  /**
   * Reports the current page, total page count, and a setter, whenever any
   * of them changes — a page turn, or the row count changing under a
   * filter or a new `data` prop. DataTable still owns the state either
   * way; this just also hands it outward, which only matters paired with
   * `hidePagination`.
   */
  onPaginationChange?: (state: DataTablePaginationState) => void;
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
 * Opt-in `filterable` adds one search box that matches across every column,
 * rather than a filter control per column: "find the row I mean" is a
 * single-box question, and per-column filter rows cost a lot of header
 * space to answer a question users mostly aren't asking. Columns
 * whose `cell` renders something the raw value doesn't describe (an avatar,
 * a badge) contribute their own `filterValue`.
 *
 * Filtering runs *before* sorting and pagination, so page counts and sort
 * order describe the rows actually on screen. Matches are announced through
 * a `role="status"` region, because filtering as you type changes the table
 * silently otherwise — a screen-reader user would get no feedback that the
 * result set moved under them (WCAG 4.1.3).
 *
 * Still deliberately scoped: no row selection, column resizing/reordering,
 * or server-side/async data. A fully-featured data grid is a genuinely
 * different, much larger component — most component libraries that ship
 * one either depend on a headless table library (TanStack Table, the
 * approach shadcn/ui's own docs recommend rather than shipping a built-in
 * data table at all) or accept a similarly bounded scope to this one. This
 * library has taken on no new dependencies for any other component, and
 * sorting, filtering, and pagination are the features that cover the large
 * majority of "I just want a nicer table" needs — see `DECISIONS.md`.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  pageSize,
  emptyMessage = "No results.",
  filterable = false,
  filterLabel = "Filter rows",
  filterPlaceholder = "Search…",
  noMatchesMessage = "No rows match your filter.",
  hidePagination = false,
  onPaginationChange,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const filterInputId = useId();

  const trimmedFilter = filter.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!filterable || trimmedFilter === "") return data;
    return data.filter((row) =>
      columns.some((column) => {
        const text = column.filterValue ? column.filterValue(row) : String(row[column.key] ?? "");
        return text.toLowerCase().includes(trimmedFilter);
      }),
    );
  }, [data, columns, filterable, trimmedFilter]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return filteredData;
    const getValue = column.sortValue ?? ((row: T) => row[column.key] as unknown as string | number);
    const sorted = [...filteredData].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const comparison =
        typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredData, sort, columns]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const clampedPage = Math.min(currentPage, totalPages);
  const pageData = pageSize
    ? sortedData.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
    : sortedData;

  // Reports outward regardless of `hidePagination` — a caller could
  // reasonably want the numbers (e.g. an "N of M" caption) even while
  // keeping the built-in footer. `setCurrentPage` is a stable useState
  // setter, so it's the only piece of this that never itself retriggers
  // the effect; `onPaginationChange` still belongs in the dependency array
  // for the ordinary reason (an inline arrow the caller passes should be
  // able to close over fresh values without this going stale).
  useEffect(() => {
    onPaginationChange?.({ page: clampedPage, totalPages, setPage: setCurrentPage });
  }, [clampedPage, totalPages, onPaginationChange]);

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
      {filterable ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={filterInputId} className="sr-only">
            {filterLabel}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <Input
              id={filterInputId}
              // `type="search"` for the browser's own clear affordance and
              // the right on-screen keyboard, the same lean-on-the-platform
              // default `Input` documents.
              type="search"
              value={filter}
              placeholder={filterPlaceholder}
              onChange={(event) => {
                setFilter(event.target.value);
                // A narrower result set can leave the current page past the
                // end; reset rather than show an empty page-4 of 2.
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          {/*
            Filtering as you type rewrites the table with no visible focus
            change, so assistive tech gets no signal that anything happened.
            This announces the new count politely, and stays empty while
            unfiltered so it says nothing on first paint.
          */}
          <span role="status" aria-live="polite" className="sr-only">
            {trimmedFilter === ""
              ? ""
              : `${sortedData.length} ${sortedData.length === 1 ? "row" : "rows"} match ${filter.trim()}`}
          </span>
        </div>
      ) : null}
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
                        "inline-flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:shadow-[rgba(15,23,42,0.08)_0px_0px_0px_3px,rgba(15,23,42,0.16)_0px_0px_12px_2px] dark:text-slate-400 dark:hover:text-white dark:focus-visible:shadow-[rgba(255,255,255,0.1)_0px_0px_0px_3px,rgba(255,255,255,0.2)_0px_0px_12px_2px]",
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
                {filterable && trimmedFilter !== "" ? noMatchesMessage : emptyMessage}
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
      {!hidePagination && pageSize && totalPages > 1 ? (
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
