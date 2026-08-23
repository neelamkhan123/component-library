import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../Table/Table";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

/**
 * The categorical series palette, in fixed slot order. Assign slots in order
 * and never cycle them: a ninth series folds into an "Other" bucket or splits
 * into small multiples instead of getting a generated hue.
 *
 * Both columns were validated as a set against this library's own surfaces
 * (white and `slate-950`) — not inherited from a general-purpose palette —
 * for lightness band, chroma floor, adjacent-pair separation under simulated
 * protanopia/deuteranopia/tritanopia, adjacent-pair separation for normal
 * vision, and contrast against the surface. Reordering or re-stepping these
 * invalidates that; see `DECISIONS.md` for the measured numbers.
 */
export const chartSeriesColors = {
  light: ["#2563eb", "#f97316", "#0d9488", "#f59e0b", "#f472b6", "#15803d", "#6d28d9", "#ef4444"],
  dark: ["#3b82f6", "#ea580c", "#0d9488", "#d97706", "#ec4899", "#16a34a", "#8b5cf6", "#ef4444"],
} as const;

/**
 * How many series stay distinguishable when *every* pair can end up adjacent —
 * scatter, bubble, and small multiples, where series aren't laid out in a fixed
 * neighbouring order. Line and bar charts, whose adjacent pairs are the only
 * ones that matter, can use all eight slots.
 */
export const chartAllPairsSeriesLimit = 3;

/**
 * `--chart-1` … `--chart-8` for both themes, written out as **literal** class
 * names.
 *
 * These deliberately aren't generated from `chartSeriesColors` above, even
 * though that would obviously be DRY-er. Tailwind scans source *text* for
 * class names: a class assembled at runtime from a template literal is one
 * the scanner never sees, so it emits no CSS for it, every `var(--chart-N)`
 * resolves to nothing, and every mark on every chart renders invisible —
 * which is exactly what happened when this was built with `.map()`. It has
 * to be literal here for the same reason it has to survive into `dist/`,
 * where a consumer's own Tailwind build scans this package via `@source`.
 *
 * `Chart.test.tsx` asserts this string stays in sync with the arrays above,
 * so the duplication can't drift silently.
 */
const seriesColorVariables =
  "[--chart-1:#2563eb] " +
  "[--chart-2:#f97316] " +
  "[--chart-3:#0d9488] " +
  "[--chart-4:#f59e0b] " +
  "[--chart-5:#f472b6] " +
  "[--chart-6:#15803d] " +
  "[--chart-7:#6d28d9] " +
  "[--chart-8:#ef4444] " +
  "dark:[--chart-1:#3b82f6] " +
  "dark:[--chart-2:#ea580c] " +
  "dark:[--chart-3:#0d9488] " +
  "dark:[--chart-4:#d97706] " +
  "dark:[--chart-5:#ec4899] " +
  "dark:[--chart-6:#16a34a] " +
  "dark:[--chart-7:#8b5cf6] " +
  "dark:[--chart-8:#ef4444]";

export interface ChartProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** What the chart shows. Rendered as the figure's caption and used as its accessible name. */
  title: ReactNode;
  /** The takeaway — the sentence a reader would otherwise have to derive from the marks. */
  description?: ReactNode;
  /** Plot height in pixels, reserved before the chart renders so its arrival doesn't shift the page. Defaults to `260`. */
  height?: number;
  /** A `ChartLegend`, rendered under the caption and above the plot. */
  legend?: ReactNode;
  /** A `ChartDataTable` holding the same numbers — the accessible equivalent of the marks. */
  dataTable?: ReactNode;
  /** The plot itself, e.g. a Recharts `<ResponsiveContainer>`. */
  children: ReactNode;
}

/**
 * The accessible, themed shell a chart sits inside — caption, description,
 * legend, reserved plot box, and the data-table equivalent of the marks.
 *
 * Deliberately **not** a wrapper around a specific charting library. The plot
 * is whatever you pass as `children`: a Recharts `<LineChart>`, a `<BarChart>`,
 * or hand-written SVG. Recharts is declared as an *optional* `peerDependency`,
 * so it is never bundled, never imported here, and consumers who don't chart
 * pay nothing for it — the same "no dependency without a concrete need"
 * position `DataTable` takes toward headless table libraries. It also means
 * this component doesn't rot when Recharts changes its API.
 *
 * What it does own is everything that is easy to get wrong and identical
 * across every chart:
 *
 * - **Series color.** Sets `--chart-1` … `--chart-8` from `chartSeriesColors`,
 *   re-stepped for dark mode rather than flipped, so plot children reference
 *   `var(--chart-1)` and theme correctly in both. Three of the light steps sit
 *   below 3:1 against white, which is why the legend and data table below are
 *   not optional decoration — they're the required relief.
 * - **Identity beyond color** (WCAG 1.4.1). The plot is `aria-hidden` and the
 *   real accessible content is `dataTable`, so the numbers are reachable by
 *   screen reader, by keyboard, and by anyone who can't separate two hues.
 * - **A reserved plot box**, so an async chart doesn't shift the layout when
 *   it arrives — the same concern `AvatarGroup` addresses for images.
 *
 * Renders a `<figure>`/`<figcaption>`: a chart is exactly the referenced,
 * captioned content that element is for.
 */
export const Chart = forwardRef<HTMLElement, ChartProps>(
  ({ title, description, height = 260, legend, dataTable, className, children, ...props }, ref) => {
    const captionId = useId();
    const descriptionId = useId();

    return (
      <figure
        ref={ref}
        aria-labelledby={captionId}
        aria-describedby={description ? descriptionId : undefined}
        className={mergeClassNames("flex flex-col gap-3", seriesColorVariables, className)}
        {...props}
      >
        <figcaption className="flex flex-col gap-1">
          <span id={captionId} className="text-sm font-semibold text-slate-950 dark:text-white">
            {title}
          </span>
          {description ? (
            <span id={descriptionId} className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          ) : null}
        </figcaption>

        {legend}

        {/*
          The marks are decoration for assistive tech: an SVG plot exposes a
          pile of unlabeled shapes, and `dataTable` carries the same numbers in
          a form that can actually be read. `height` is reserved up front so
          the box doesn't collapse before the plot measures itself.
        */}
        <div aria-hidden="true" style={{ height }} className="w-full">
          {children}
        </div>

        {dataTable}
      </figure>
    );
  },
);
Chart.displayName = "Chart";

export interface ChartLegendProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

/**
 * The key mapping each series' color to its name. Always present for two or
 * more series; a single-series chart needs none, because the title already
 * names what's plotted.
 */
export const ChartLegend = forwardRef<HTMLUListElement, ChartLegendProps>(
  ({ className, children, ...props }, ref) => (
    <ul ref={ref} className={mergeClassNames("flex flex-wrap items-center gap-x-4 gap-y-1", className)} {...props}>
      {children}
    </ul>
  ),
);
ChartLegend.displayName = "ChartLegend";

export interface ChartLegendItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Any CSS color — normally `var(--chart-1)` and friends, set by `Chart`. */
  color: string;
  children: ReactNode;
}

/**
 * One series' swatch and name. The label wears a text color, never the series
 * color: the lighter categorical steps are illegible as text on the surface,
 * so identity comes from the swatch *beside* the label instead.
 */
export const ChartLegendItem = forwardRef<HTMLLIElement, ChartLegendItemProps>(
  ({ color, className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={mergeClassNames("flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        style={{ backgroundColor: color }}
        className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-950"
      />
      {children}
    </li>
  ),
);
ChartLegendItem.displayName = "ChartLegendItem";

export interface ChartDataTableColumn<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
}

export interface ChartDataTableProps<T> {
  columns: ChartDataTableColumn<T>[];
  data: T[];
  /** Describes the table for assistive tech. Usually the chart's own title. */
  caption: ReactNode;
  /**
   * Keeps the table `sr-only` — present for assistive tech, invisible on
   * screen. Defaults to `true`. Set `false` where the numbers are worth
   * showing to everyone, which is also the relief for the light-mode series
   * steps that sit below 3:1 contrast.
   */
  visuallyHidden?: boolean;
}

/**
 * The chart's numbers as a real table — what a screen reader, a keyboard user,
 * and anyone who can't separate two hues actually reads, since `Chart` hides
 * the plot itself from assistive tech.
 *
 * Built on `Table` rather than a bespoke grid, so a visible data table matches
 * every other table in the library. It's a separate component, not something
 * `Chart` derives, because only the caller knows how its series map to columns
 * and how each value should be formatted for reading aloud.
 */
export function ChartDataTable<T>({ columns, data, caption, visuallyHidden = true }: ChartDataTableProps<T>) {
  return (
    <div className={visuallyHidden ? "sr-only" : undefined}>
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, columnIndex) => (
                // Numbers in a column, where `tabular-nums` earns its keep —
                // unlike `StatCard`'s standalone value.
                <TableCell key={columnIndex} className="tabular-nums">
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
