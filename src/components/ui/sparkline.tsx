import { cn } from "@/lib/utils";

type SparklineProps = {
  values: number[];
  className?: string;
  /** Series color; defaults to the first categorical slot. */
  color?: string;
  area?: boolean;
};

/** Tiny trend line for tables and stat tiles. Decorative: always print the number beside it. */
export const Sparkline = ({ values, className, color = "var(--chart-1)", area = true }: SparklineProps) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const line = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 30 - ((value - min) / span) * 24;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
      aria-hidden="true"
    >
      {area ? <polygon points={`0,32 ${line} 100,32`} fill={color} fillOpacity={0.08} /> : null}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
