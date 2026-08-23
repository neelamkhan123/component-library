---
"@neelamkhan21/ui": minor
---

Add six dashboard components and give `DataTable` filtering.

New components:

- **`StatCard`** — the "big number + trend" KPI tile. The delta never relies
  on color alone (arrow icon plus an `sr-only` direction phrase), and
  `deltaDirection` decides whether a rise is good news, since "up" isn't
  universally good (active users rising is; response time rising isn't).
- **`Chart`** — the accessible, themed shell a chart sits inside: caption,
  legend, a validated eight-slot series palette exposed as `--chart-1` …
  `--chart-8`, a reserved plot box, and the data-table equivalent of the
  marks. Not a charting engine — the plot is whatever you pass as children.
  Recharts is an **optional** peer dependency, so nothing is bundled.
- **`Sparkline`** — a hand-drawn SVG trend line for inline use, colored with
  `currentColor` and decorative by default.
- **`DateRangePicker`** — presets plus a custom from/to range, assembled from
  `Popover`, two `Calendar`s, and a real `RadioGroup`.
- **`EmptyState`** — the "no data yet" panel, with an opt-in polite live
  region for the case where it replaces content in place.
- **`AvatarGroup`** — stacked avatars with a `+N` overflow that is
  announced, not just drawn, and boxes reserved before images load so the
  stack never reflows.

`DataTable` gains opt-in `filterable`: one search box matching across every
column, running before sorting and pagination, with match counts announced
through a live region and a distinct message for "filtered to nothing" vs
"no data at all". Columns can supply `filterValue` or opt out of matching.
