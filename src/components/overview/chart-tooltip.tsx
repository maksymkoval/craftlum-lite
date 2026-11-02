import { formatDay } from "@/lib/format";

export type ChartTooltipRow = {
  key: string;
  label: string;
  colorVar: string;
  value: string;
};

type ChartTooltipCardProps = {
  date: string;
  rows: ChartTooltipRow[];
  total?: string;
};

/** Shared tooltip body: text in ink, a colored swatch carries series identity. */
export const ChartTooltipCard = ({ date, rows, total }: ChartTooltipCardProps) => (
  <div className="min-w-44 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md shadow-black/5">
    <p className="mb-1.5 font-medium">{formatDay(date)}</p>
    <ul className="flex flex-col gap-1">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center gap-2">
          <span className="size-2 rounded-[3px]" style={{ background: row.colorVar }} />
          <span className="text-muted-foreground">{row.label}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums">{row.value}</span>
        </li>
      ))}
    </ul>
    {total ? (
      <p className="mt-1.5 flex justify-between border-t pt-1.5">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium tabular-nums">{total}</span>
      </p>
    ) : null}
  </div>
);
