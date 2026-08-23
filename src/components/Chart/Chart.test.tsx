import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import {
  Chart,
  ChartDataTable,
  ChartLegend,
  ChartLegendItem,
  chartAllPairsSeriesLimit,
  chartSeriesColors,
} from "./Chart";

expect.extend(toHaveNoViolations);

const rows = [
  { week: "W1", desktop: 12, mobile: 18 },
  { week: "W2", desktop: 15, mobile: 14 },
];

const columns = [
  { header: "Week", cell: (row: (typeof rows)[number]) => row.week },
  { header: "Desktop", cell: (row: (typeof rows)[number]) => row.desktop },
  { header: "Mobile", cell: (row: (typeof rows)[number]) => row.mobile },
];

function FullChart() {
  return (
    <Chart
      title="Sessions per week"
      description="Desktop is up 25% over the period."
      legend={
        <ChartLegend>
          <ChartLegendItem color="var(--chart-1)">Desktop</ChartLegendItem>
          <ChartLegendItem color="var(--chart-2)">Mobile</ChartLegendItem>
        </ChartLegend>
      }
      dataTable={<ChartDataTable caption="Sessions per week" columns={columns} data={rows} />}
    >
      <svg data-testid="plot" />
    </Chart>
  );
}

test("Chart renders with no accessibility violations", async () => {
  const { container } = render(<FullChart />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Chart names itself from its title and describes itself from its description", () => {
  render(<FullChart />);
  const figure = screen.getByRole("figure", { name: "Sessions per week" });
  expect(figure).toHaveAccessibleDescription("Desktop is up 25% over the period.");
});

test("Chart omits the description wiring when none is given", () => {
  render(
    <Chart title="Sessions per week">
      <svg />
    </Chart>,
  );
  expect(screen.getByRole("figure")).not.toHaveAttribute("aria-describedby");
});

test("Chart hides the plot from assistive tech", () => {
  render(<FullChart />);
  // The marks are decoration; ChartDataTable carries the real content.
  expect(screen.getByTestId("plot").parentElement).toHaveAttribute("aria-hidden", "true");
});

test("Chart reserves the plot's height up front", () => {
  render(
    <Chart title="Sessions per week" height={320}>
      <svg data-testid="plot" />
    </Chart>,
  );
  expect(screen.getByTestId("plot").parentElement).toHaveStyle({ height: "320px" });
});

test("Chart declares a series custom property per slot, for both themes", () => {
  render(<FullChart />);
  const figure = screen.getByRole("figure");

  // Note what this does *not* prove: that Tailwind emitted CSS for these
  // classes. It can't — the class being present on the element is true even
  // when the scanner never saw it and `var(--chart-N)` resolves to nothing.
  // The sync check below is what stops that regressing; the classes must
  // stay literal in the source for Tailwind (and a consumer's own build,
  // scanning `dist/` via `@source`) to find them at all.
  for (const [index, color] of chartSeriesColors.light.entries()) {
    expect(figure).toHaveClass(`[--chart-${index + 1}:${color}]`);
  }
  for (const [index, color] of chartSeriesColors.dark.entries()) {
    expect(figure).toHaveClass(`dark:[--chart-${index + 1}:${color}]`);
  }
});

test("the literal series classes stay in sync with chartSeriesColors", () => {
  render(<FullChart />);
  const classNames = screen.getByRole("figure").className.split(/\s+/);

  // Reconstructs the palette back out of the class names actually rendered,
  // so editing one of the two lists without the other fails here rather than
  // shipping a chart whose marks don't match its documented palette.
  const parse = (prefix: string) =>
    classNames
      .filter((name) => name.startsWith(`${prefix}[--chart-`))
      .map((name) => /\[--chart-(\d+):(#[0-9a-f]{6})\]/.exec(name))
      .filter((match): match is RegExpExecArray => match !== null)
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map((match) => match[2]);

  expect(parse("")).toEqual([...chartSeriesColors.light]);
  expect(parse("dark:")).toEqual([...chartSeriesColors.dark]);
});

test("Chart merges a custom className with its defaults", () => {
  render(
    <Chart title="Sessions per week" className="custom-chart">
      <svg />
    </Chart>,
  );
  expect(screen.getByRole("figure")).toHaveClass("custom-chart", "flex-col");
});

test("Chart forwards its ref to the underlying figure", () => {
  const ref = createRef<HTMLElement>();
  render(
    <Chart ref={ref} title="Sessions per week">
      <svg />
    </Chart>,
  );
  expect(ref.current?.tagName).toBe("FIGURE");
});

test("ChartLegend lists one item per series with a decorative swatch", () => {
  render(<FullChart />);
  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent("Desktop");
  // The label wears a text color; identity comes from the swatch beside it.
  expect(items[0].querySelector('[aria-hidden="true"]')).toHaveStyle({ backgroundColor: "var(--chart-1)" });
});

test("ChartDataTable renders the same numbers as a real table", () => {
  render(<FullChart />);
  const table = screen.getByRole("table");
  expect(within(table).getAllByRole("columnheader").map((c) => c.textContent)).toEqual([
    "Week",
    "Desktop",
    "Mobile",
  ]);
  expect(within(table).getAllByRole("row")).toHaveLength(rows.length + 1);
  expect(within(table).getByText("15")).toBeInTheDocument();
});

test("ChartDataTable is visually hidden but present by default", () => {
  const { container } = render(<FullChart />);
  expect(container.querySelector(".sr-only")).toContainElement(screen.getByRole("table"));
});

test("ChartDataTable can be shown to everyone", () => {
  const { container } = render(
    <ChartDataTable caption="Sessions per week" columns={columns} data={rows} visuallyHidden={false} />,
  );
  expect(container.firstChild).not.toHaveClass("sr-only");
});

test("chartSeriesColors ships eight validated slots for both themes", () => {
  expect(chartSeriesColors.light).toHaveLength(8);
  expect(chartSeriesColors.dark).toHaveLength(8);
  // Dark is re-stepped for the dark surface, not a flip of the light set.
  expect(chartSeriesColors.dark[0]).not.toBe(chartSeriesColors.light[0]);
  expect(chartAllPairsSeriesLimit).toBeLessThan(chartSeriesColors.light.length);
});
