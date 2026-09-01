"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Chart,
  ChartDataTable,
  ChartLegend,
  ChartLegendItem,
} from "neelam-ui";

const data = [
  { month: "Jan", signups: 210, activations: 140 },
  { month: "Feb", signups: 260, activations: 180 },
  { month: "Mar", signups: 245, activations: 175 },
  { month: "Apr", signups: 310, activations: 220 },
  { month: "May", signups: 380, activations: 280 },
  { month: "Jun", signups: 420, activations: 330 },
];

export default function ChartDemo() {
  return (
    <Chart
      className="w-full"
      title="Signups and activations"
      description="Activations have tracked signups closely since March."
      legend={
        <ChartLegend>
          <ChartLegendItem color="var(--chart-1)">Signups</ChartLegendItem>
          <ChartLegendItem color="var(--chart-2)">Activations</ChartLegendItem>
        </ChartLegend>
      }
      // The plot is aria-hidden, so this table is the accessible equivalent.
      dataTable={
        <ChartDataTable
          caption="Signups and activations by month"
          columns={[
            { header: "Month", cell: (row) => row.month },
            { header: "Signups", cell: (row) => row.signups },
            { header: "Activations", cell: (row) => row.activations },
          ]}
          data={data}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Line
            type="monotone"
            dataKey="signups"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="activations"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Chart>
  );
}
