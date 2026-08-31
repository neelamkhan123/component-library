import type { Meta, StoryObj } from "@storybook/react";
import { Chart, ChartDataTable, ChartLegend, ChartLegendItem, chartSeriesColors } from "./Chart";

const meta: Meta<typeof Chart> = {
  title: "Components/Chart",
  component: Chart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The accessible, themed shell a chart sits inside — caption, description, legend, a reserved plot box, and the data-table equivalent of the marks. It is **not** a wrapper around a charting library: the plot is whatever you pass as `children` (a Recharts `<LineChart>`, a `<BarChart>`, hand-written SVG). Recharts is an *optional* peer dependency, so nothing is bundled and consumers who don't chart pay nothing. What `Chart` owns is the part that's identical across every chart and easy to get wrong: series color as `--chart-1`…`--chart-8` (re-stepped for dark mode, not flipped), hiding the marks from assistive tech in favour of a real table, and reserving the plot's height so an async chart doesn't shift the page.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Chart>;

const weeks = [
  { week: "W1", desktop: 12, mobile: 18 },
  { week: "W2", desktop: 15, mobile: 14 },
  { week: "W3", desktop: 19, mobile: 16 },
  { week: "W4", desktop: 17, mobile: 11 },
  { week: "W5", desktop: 24, mobile: 13 },
  { week: "W6", desktop: 22, mobile: 9 },
];

const columns = [
  { header: "Week", cell: (row: (typeof weeks)[number]) => row.week },
  { header: "Desktop", cell: (row: (typeof weeks)[number]) => row.desktop },
  { header: "Mobile", cell: (row: (typeof weeks)[number]) => row.mobile },
];

/**
 * Stands in for a real charting library so these stories stay dependency-free.
 * A grouped bar plot: thin bars, a 2px surface gap between the pair, 4px
 * rounded tops anchored to the baseline, and series color read from the
 * `--chart-*` properties `Chart` sets.
 */
function GroupedBars({ data }: { data: typeof weeks }) {
  const max = Math.max(...data.flatMap((d) => [d.desktop, d.mobile]));
  return (
    <div className="flex h-full w-full items-end gap-3 border-b border-slate-200 pb-0 dark:border-slate-800">
      {data.map((row) => (
        <div key={row.week} className="flex h-full flex-1 flex-col justify-end gap-1">
          <div className="flex h-full items-end gap-0.5">
            <div
              className="flex-1 rounded-t"
              style={{ height: `${(row.desktop / max) * 100}%`, backgroundColor: "var(--chart-1)" }}
            />
            <div
              className="flex-1 rounded-t"
              style={{ height: `${(row.mobile / max) * 100}%`, backgroundColor: "var(--chart-2)" }}
            />
          </div>
          <span className="text-center text-[10px] text-slate-500 dark:text-slate-400">{row.week}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * A second stand-in, to make the point that `Chart` is indifferent to the
 * plot: same shell, same palette slots, same data table — only the marks
 * changed. The lines live in an `preserveAspectRatio="none"` SVG so they
 * stretch to the box, with `non-scaling-stroke` keeping them an even 2px,
 * and the end labels are HTML on top so they don't stretch with it.
 */
function LinePlot({ data }: { data: typeof weeks }) {
  const max = Math.max(...data.flatMap((d) => [d.desktop, d.mobile]));
  const toPoints = (pick: (row: (typeof weeks)[number]) => number) =>
    data.map((row, index) => `${(index / (data.length - 1)) * 100},${100 - (pick(row) / max) * 100}`).join(" ");

  return (
    <div className="flex h-full w-full flex-col gap-1">
      <div className="relative flex-1 border-b border-slate-200 dark:border-slate-800">
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {([
            { points: toPoints((row) => row.desktop), color: "var(--chart-1)" },
            { points: toPoints((row) => row.mobile), color: "var(--chart-2)" },
          ] as const).map((series) => (
            <polyline
              key={series.color}
              points={series.points}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between">
        {data.map((row) => (
          <span key={row.week} className="text-[10px] text-slate-500 dark:text-slate-400">
            {row.week}
          </span>
        ))}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Chart
      className="w-full"
      title="Sessions per week"
      description="Desktop sessions rose 83% over six weeks while mobile sessions fell."
      legend={
        <ChartLegend>
          <ChartLegendItem color="var(--chart-1)">Desktop</ChartLegendItem>
          <ChartLegendItem color="var(--chart-2)">Mobile</ChartLegendItem>
        </ChartLegend>
      }
      dataTable={<ChartDataTable caption="Sessions per week" columns={columns} data={weeks} />}
    >
      <GroupedBars data={weeks} />
    </Chart>
  ),
};

export const VisibleDataTable: Story = {
  name: "With the data table shown",
  render: () => (
    <Chart
      className="w-full"
      title="Sessions per week"
      description="The same numbers, shown to everyone rather than only to assistive tech."
      legend={
        <ChartLegend>
          <ChartLegendItem color="var(--chart-1)">Desktop</ChartLegendItem>
          <ChartLegendItem color="var(--chart-2)">Mobile</ChartLegendItem>
        </ChartLegend>
      }
      dataTable={
        <ChartDataTable caption="Sessions per week" columns={columns} data={weeks} visuallyHidden={false} />
      }
    >
      <GroupedBars data={weeks} />
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Three of the light-mode series steps sit below 3:1 contrast against white. A visible data table is the documented relief for that — as are the legend labels, which is why neither is optional decoration.",
      },
    },
  },
};

export const SingleSeries: Story = {
  name: "A single series (no legend)",
  render: () => (
    <Chart
      className="w-full"
      title="Desktop sessions per week"
      description="Up 83% over six weeks."
      dataTable={
        <ChartDataTable
          caption="Desktop sessions per week"
          columns={columns.slice(0, 2)}
          data={weeks}
        />
      }
    >
      <div className="flex h-full w-full items-end gap-3 border-b border-slate-200 dark:border-slate-800">
        {weeks.map((row) => (
          <div
            key={row.week}
            className="flex-1 rounded-t"
            style={{ height: `${(row.desktop / 24) * 100}%`, backgroundColor: "var(--chart-1)" }}
          />
        ))}
      </div>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story: "One series needs no legend — the title already names what's plotted.",
      },
    },
  },
};

export const Palette: Story = {
  name: "The series palette",
  render: () => (
    <div className="flex w-full flex-col gap-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Assign slots in fixed order and never cycle them — a ninth series folds into an “Other” bucket or splits
        into small multiples. Both columns were validated as a set against this library’s own surfaces (white and
        <code className="mx-1">slate-950</code>) for lightness band, chroma floor, adjacent-pair separation under
        simulated protanopia/deuteranopia/tritanopia, normal-vision separation, and contrast.
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {chartSeriesColors.light.map((light, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: light }} />
            <span
              className="h-4 w-4 shrink-0 rounded ring-1 ring-slate-200 dark:ring-slate-800"
              style={{ backgroundColor: chartSeriesColors.dark[index] }}
            />
            <span className="text-slate-600 dark:text-slate-300">
              Slot {index + 1} — <code>--chart-{index + 1}</code>
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const AsALineChart: Story = {
  name: "The same chart, as a line plot",
  render: () => (
    <Chart
      className="w-full"
      title="Sessions per week"
      description="Desktop sessions rose 83% over six weeks while mobile sessions fell."
      legend={
        <ChartLegend>
          <ChartLegendItem color="var(--chart-1)">Desktop</ChartLegendItem>
          <ChartLegendItem color="var(--chart-2)">Mobile</ChartLegendItem>
        </ChartLegend>
      }
      dataTable={<ChartDataTable caption="Sessions per week" columns={columns} data={weeks} />}
    >
      <LinePlot data={weeks} />
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Identical to the default story apart from the child. `Chart` is a shell, not a chart type — it owns the caption, legend, `--chart-*` palette, reserved plot box, and data table, and renders whatever marks you hand it. Swapping bars for lines needs no prop and no change to `Chart` at all. In a real app this child is a Recharts `<LineChart>`; these stand-ins exist only so the stories run without the optional peer dependency installed.",
      },
    },
  },
};
