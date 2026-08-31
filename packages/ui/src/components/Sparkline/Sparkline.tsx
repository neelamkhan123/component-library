import { forwardRef, useId, type SVGAttributes } from "react";

function mergeClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, "children" | "width" | "height"> {
  /** The series, oldest value first. Fewer than two points renders nothing. */
  data: number[];
  /** Coordinate-space width. The rendered size comes from CSS — this only sets the aspect ratio. Defaults to `96`. */
  width?: number;
  /** Coordinate-space height. Defaults to `24`. */
  height?: number;
  variant?: "line" | "bar";
  /** Stroke width for `variant="line"`, in CSS pixels (it doesn't scale with the box). Defaults to `2`. */
  strokeWidth?: number;
  /** Draws a filled dot on the most recent point, the "current period in the accent" end-marker. */
  showEndPoint?: boolean;
  /**
   * Accessible name. Omit — the default — to render the sparkline decoratively
   * (`aria-hidden`), which is correct whenever the number it trends is already
   * stated next to it, as in `StatCard`.
   */
  label?: string;
}

/**
 * A tiny, axis-less trend line sized to sit inline — in a `StatCard`, a table
 * cell, or beside a heading. Hand-drawn as plain SVG rather than pulled from a
 * charting library: a sparkline is a polyline through normalized points and an
 * optional end dot, which is a few lines of arithmetic, and `Chart` already
 * exists for the case that genuinely wants a chart engine. That keeps the
 * library's dependency count where `Calendar` (hand-rolled date math) and
 * `DataTable` (no headless-table dependency) already put it — see `DECISIONS.md`.
 *
 * Colored with `currentColor`, the way `lucide-react`'s icons are, so a caller
 * tints it by setting `text-*` on the sparkline or any ancestor rather than
 * through a `color` prop this component would have to re-theme for dark mode.
 *
 * Decorative by default. A sparkline is a redundant restatement of a number
 * that is nearly always written out beside it, so announcing it too would be
 * noise; pass `label` for the rare standalone case, and prefer a real `Chart`
 * plus its data table whenever the trend is the primary content.
 */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      width = 96,
      height = 24,
      variant = "line",
      strokeWidth = 2,
      showEndPoint = false,
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const gradientId = useId();

    // A single point has no trend to draw and no baseline to draw it against,
    // so there is nothing meaningful to render rather than a misleading dot.
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    // Inset by half the stroke so the line's own width isn't clipped at the
    // top and bottom edges of the viewBox.
    const inset = strokeWidth / 2;
    const plotHeight = Math.max(height - strokeWidth, 0);

    // A flat series has no range to normalize against; centering it reads as
    // "no change", which is exactly what it is.
    const toY = (value: number) =>
      max === min ? height / 2 : inset + plotHeight - ((value - min) / (max - min)) * plotHeight;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: toY(value),
    }));

    const lastPoint = points[points.length - 1];

    const accessibilityProps = label
      ? ({ role: "img", "aria-label": label } as const)
      : ({ "aria-hidden": "true" } as const);

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        // The box is stretched by CSS, so let it distort freely rather than
        // letter-boxing; `non-scaling-stroke` below keeps the line itself an
        // even weight regardless of how far it's stretched.
        preserveAspectRatio="none"
        className={mergeClassNames("h-6 w-24 overflow-visible", className)}
        {...accessibilityProps}
        {...props}
      >
        {variant === "bar" ? (
          data.map((value, index) => {
            // Leave a 1px surface gap between bars — the same "fills never
            // touch" rule the full-size charts follow, at sparkline scale.
            const slot = width / data.length;
            const barWidth = Math.max(slot - 1, 0.5);
            const y = toY(value);
            return (
              <rect
                key={index}
                x={index * slot}
                y={y}
                width={barWidth}
                height={Math.max(height - y, 0.5)}
                rx={0.5}
                fill="currentColor"
              />
            );
          })
        ) : (
          <>
            <defs>
              {/* Fades the area under the line out rather than filling it flat,
                  so the line stays the mark being read at this size. */}
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,${height} ${points.map((p) => `${p.x},${p.y}`).join(" ")} ${width},${height}`}
              fill={`url(#${gradientId})`}
            />
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {showEndPoint ? (
          <circle cx={lastPoint.x} cy={lastPoint.y} r={strokeWidth} fill="currentColor" vectorEffect="non-scaling-stroke" />
        ) : null}
      </svg>
    );
  },
);
Sparkline.displayName = "Sparkline";
