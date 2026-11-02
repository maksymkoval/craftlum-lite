import { cn } from "@/lib/utils";

/**
 * Pin: a numbered marker that links a sentence in the briefing to the moment
 * it refers to on a chart. The number is a reference, not decoration.
 */
export const Pin = ({ n, className }: { n: number; className?: string }) => (
  <span
    aria-label={`Note ${n}`}
    className={cn(
      "inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-pin align-[1px] text-[10.5px] font-semibold text-pin-foreground tabular-nums",
      className,
    )}
  >
    {n}
  </span>
);

type ChartPinProps = { cx?: number; cy?: number; n: number };

/** SVG version for Recharts `ReferenceDot` shapes. */
export const ChartPin = ({ cx = 0, cy = 0, n }: ChartPinProps) => (
  <g aria-hidden="true">
    <circle cx={cx} cy={cy} r={9} fill="var(--pin)" stroke="var(--card)" strokeWidth={2} />
    <text
      x={cx}
      y={cy}
      dy="0.35em"
      textAnchor="middle"
      fontSize={10.5}
      fontWeight={600}
      fill="var(--pin-foreground)"
    >
      {n}
    </text>
  </g>
);
